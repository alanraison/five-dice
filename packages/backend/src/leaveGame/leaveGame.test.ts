import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import {
  CreateEventBusCommand,
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
} from '@aws-sdk/client-eventbridge';
import {
  CreateQueueCommand,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {
  LocalstackContainer,
  StartedLocalStackContainer,
} from '@testcontainers/localstack';
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { localstackContainer } from '../../test/config.js';
import { createTable } from '../../test/dynamodb.js';
import { createGame } from '../../test/game.js';
import { JoinGameDAO, joinGameDAOFactory } from '../joinGame/dao.js';
import { leaveGameDAOFactory } from './dao.js';
import { queuerFactory } from './event.js';
import { handlerFactory, LeaveGameHandler } from './handler.js';

describe('leaveGame handler', () => {
  const tableName = 'LeaveGameTestTable';
  let container: StartedLocalStackContainer;
  let ddb: DynamoDBClient;
  let eventBridgeClient: EventBridgeClient;
  let sqsClient: SQSClient;
  const eventBusName = 'leave-game-test-bus';
  const queueName = 'leave-game-test-queue';
  let queueUrl: string | undefined;
  let joinGameDAO: JoinGameDAO;
  let handler: LeaveGameHandler;

  beforeAll(async () => {
    container = await new LocalstackContainer(localstackContainer)
      .start();
    ddb = new DynamoDBClient({
      endpoint: container.getConnectionUri(),
      region: 'us-east-1',
    });
    eventBridgeClient = new EventBridgeClient({
      endpoint: container.getConnectionUri(),
      region: 'us-east-1',
    });
    sqsClient = new SQSClient({
      endpoint: container.getConnectionUri(),
      region: 'us-east-1',
    });
    await createTable(ddb, tableName);
    await eventBridgeClient.send(
      new CreateEventBusCommand({ Name: eventBusName }),
    );
    const queue = await sqsClient.send(
      new CreateQueueCommand({ QueueName: queueName }),
    );
    queueUrl = queue.QueueUrl;
    await eventBridgeClient.send(
      new PutRuleCommand({
        EventBusName: eventBusName,
        Name: 'leave-game-test',
        EventPattern: JSON.stringify({
          source: ['five-dice-wsapi'],
        }),
      }),
    );
    await eventBridgeClient.send(
      new PutTargetsCommand({
        EventBusName: eventBusName,
        Rule: 'leave-game-test',
        Targets: [
          {
            Id: 'leave-game-target',
            Arn: `arn:aws:sqs:us-east-1:000000000000:${queueName}`,
          },
        ],
      }),
    );
    joinGameDAO = joinGameDAOFactory(ddb, tableName);
    handler = handlerFactory(
      leaveGameDAOFactory(ddb, tableName),
      queuerFactory(eventBridgeClient, eventBusName),
    );
  }, 60_000);
  afterAll(async () => {
    await container.stop();
  });
  afterEach(async () => {
    await sqsClient.send(
      new PurgeQueueCommand({
        QueueUrl: queueUrl,
      }),
    );
  });
  it('should remove the player from the game', async () => {
    const gameId = await createGame(ddb, tableName);
    await joinGameDAO(
      gameId,
      { name: 'Alice', character: 'Wizard' },
      'connection-123',
    );
    await joinGameDAO(
      gameId,
      { name: 'Bob', character: 'Fighter' },
      'connection-456',
    );

    await handler({
      requestContext: {
        connectionId: 'connection-123',
      },
    });
    const gameItem = await ddb.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          PK: { S: `GAME#${gameId}` },
        },
      }),
    );
    expect(gameItem.Item?.Characters.M).not.toHaveProperty('Alice');
    expect(gameItem.Item?.Characters.M).toHaveProperty('Bob');
  });
  it('should delete the connection from the connections table', async () => {
    const gameId = await createGame(ddb, tableName);
    await joinGameDAO(
      gameId,
      { name: 'Alice', character: 'Wizard' },
      'connection-789',
    );

    await handler({
      requestContext: {
        connectionId: 'connection-789',
      },
    });
    const connectionItem = await ddb.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          PK: { S: `CONN#connection-789` },
        },
      }),
    );
    expect(connectionItem.Item).toBeUndefined();
  });
  it('should emit a player-left event to EventBridge', async () => {
    const gameId = await createGame(ddb, tableName);
    await joinGameDAO(
      gameId,
      { name: 'Alice', character: 'Wizard' },
      'connection-000',
    );

    await handler({
      requestContext: {
        connectionId: 'connection-000',
      },
    });

    const { Messages: messages } = await sqsClient.send(
      new ReceiveMessageCommand({
        MaxNumberOfMessages: 10,
        QueueUrl: queueUrl!,
      }),
    );
    expect(messages).toHaveLength(1);
    const event = JSON.parse(messages![0].Body!);
    expect(event).toMatchObject({
      'detail-type': 'player-left',
      detail: {
        gameId: gameId,
        player: 'Alice',
        allPlayers: [],
      },
    });
  });
});
