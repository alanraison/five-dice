import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
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
import { randomUuid } from 'testcontainers';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { localstackContainer } from '../../test/config.js';
import { createTable } from '../../test/dynamodb.js';
import { createGame } from '../../test/game.js';
import { APIGatewayWebsocketProxyEvent, handlerFactory } from './handler.js';

describe('JoinGame API', () => {
  let container: StartedLocalStackContainer;
  let ddb: DynamoDBClient;
  let eventBridgeClient: EventBridgeClient;
  let sqsClient: SQSClient;
  let queueUrl: string | undefined;
  const tableName = 'JoinGameTestTable';
  const eventBusName = 'test-event-bus';
  const queueName = 'test-queue';
  let handler: (event: APIGatewayWebsocketProxyEvent) => Promise<any>;

  beforeAll(async () => {
    container = await new LocalstackContainer(localstackContainer)
      .withReuse()
      .start();
    ddb = new DynamoDBClient({
      endpoint: container.getConnectionUri(),
      region: 'us-east-1',
    });
    eventBridgeClient = new EventBridgeClient({
      endpoint: container.getConnectionUri(),
      region: 'us-east-1',
    });
    await eventBridgeClient.send(
      new CreateEventBusCommand({ Name: eventBusName }),
    );
    sqsClient = new SQSClient({
      endpoint: container.getConnectionUri(),
      region: 'us-east-1',
    });
    await createTable(ddb, tableName);
    handler = handlerFactory({
      ddb,
      tableName,
      eventBusName,
      eventBridgeClient,
    });
    await eventBridgeClient.send(
      new PutRuleCommand({
        EventBusName: eventBusName,
        Name: 'test-rule',
        EventPattern: JSON.stringify({
          source: ['five-dice-wsapi'],
        }),
      }),
    );
    const queue = await sqsClient.send(
      new CreateQueueCommand({
        QueueName: queueName,
      }),
    );
    queueUrl = queue.QueueUrl;
    await eventBridgeClient.send(
      new PutTargetsCommand({
        EventBusName: eventBusName,
        Rule: 'test-rule',
        Targets: [
          {
            Id: 'test-target',
            Arn: `arn:aws:sqs:us-east-1:000000000000:${queueName}`,
          },
        ],
      }),
    );
  }, 60_000);
  afterAll(async () => {
    await container.stop();
  });
  beforeEach(async () => {
    await sqsClient.send(
      new PurgeQueueCommand({
        QueueUrl: queueUrl,
      }),
    );
  });
  it('should join a game successfully', async () => {
    const gameId = randomUuid();
    await createGame(ddb, tableName, gameId);
    await handler({
      requestContext: {
        connectionId: 'conn1',
      },
      queryStringParameters: {
        gameId: gameId.replace(/\+/g, '-').replace(/\//g, '_'),
        name: 'Alice',
        character: 'Warrior',
      },
    });
    const response = await ddb.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          PK: { S: `GAME#${gameId}` },
        },
      }),
    );
    expect(response.Item).toBeDefined();
    expect(response.Item).toEqual({
      PK: { S: `GAME#${gameId}` },
      T: { S: 'Game' },
      GID: { S: gameId },
      Status: { S: 'Pending' },
      Characters: {
        M: {
          Alice: { S: 'Warrior' },
        },
      },
      GSI2PK: { S: gameId },
      GSI2SK: { S: 'GAME' },
    });
    const connResponse = await ddb.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          PK: { S: `CONN#conn1` },
        },
      }),
    );
    expect(connResponse.Item).toBeDefined();
    expect(connResponse.Item).toMatchObject({
      PK: { S: `CONN#conn1` },
      T: { S: 'Connection' },
      GSI1PK: { S: gameId },
      GSI1SK: { S: 'CONN#conn1' },
      GSI2PK: { S: gameId },
      GSI2SK: { S: 'CONN#conn1' },
      CID: { S: 'conn1' },
      GID: { S: gameId },
      Player: { S: 'Alice' },
      Character: { S: 'Warrior' },
      DiceCount: { N: '5' },
      // Ttl not checked
    });
  });
  it('should record each connection for a game in GSI1', async () => {
    const gameId = randomUuid();
    await createGame(ddb, tableName, gameId);
    const connections = [
      { connectionId: 'conn1', name: 'Alice', character: 'Warrior' },
      { connectionId: 'conn2', name: 'Bob', character: 'Mage' },
    ];
    for (const conn of connections) {
      await handler({
        requestContext: {
          connectionId: conn.connectionId,
        },
        queryStringParameters: {
          gameId: gameId.replace(/\+/g, '-').replace(/\//g, '_'),
          name: conn.name,
          character: conn.character,
        },
      });
    }
    const response = await ddb.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: '#pk = :gsi1pk',
        ExpressionAttributeNames: {
          '#pk': 'GSI1PK',
        },
        ExpressionAttributeValues: {
          ':gsi1pk': { S: gameId },
        },
      }),
    );
    expect(response.Items).toBeDefined();
    expect(response.Items).toHaveLength(2);
    expect(response.Items).toContainEqual({
      PK: { S: 'CONN#conn1' },
      GSI1PK: { S: gameId },
      GSI1SK: { S: 'CONN#conn1' },
      CID: { S: 'conn1' },
      GID: { S: gameId },
      Player: { S: 'Alice' },
      DiceCount: { N: '5' },
    });
    expect(response.Items).toContainEqual({
      PK: { S: 'CONN#conn2' },
      GSI1PK: { S: gameId },
      GSI1SK: { S: 'CONN#conn2' },
      CID: { S: 'conn2' },
      GID: { S: gameId },
      Player: { S: 'Bob' },
      DiceCount: { N: '5' },
    });
  });
  it.todo('should store game data in GSI2', () => {});
  it('should notify players when a new player joins', async () => {
    const gameId = randomUuid();
    await createGame(ddb, tableName, gameId);
    await handler({
      requestContext: {
        connectionId: 'conn1',
      },
      queryStringParameters: {
        gameId: gameId.replace(/\+/g, '-').replace(/\//g, '_'),
        name: 'Alice',
        character: 'Warrior',
      },
    });
    const messages = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
      }),
    );
    expect(messages.Messages).toBeDefined();
    expect(messages.Messages).toHaveLength(1);
    const body = JSON.parse(messages.Messages?.[0].Body ?? '');
    expect(body).toMatchObject({
      detail: {
        gameId: gameId,
        newPlayer: {
          name: 'Alice',
          character: 'Warrior',
        },
        allPlayers: [
          {
            name: 'Alice',
            character: 'Warrior',
          },
        ],
      },
      "detail-type": "player-joined"
    });
  });
});
