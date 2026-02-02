import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createGame } from '../../test/game.js';
import {
  LocalstackContainer,
  StartedLocalStackContainer,
} from '@testcontainers/localstack';
import { localstackContainer } from '../../test/config.js';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { createTable } from '../../test/dynamodb.js';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { mockClient } from 'aws-sdk-client-mock';
import { JoinGameDAO, joinGameDAOFactory } from '../joinGame/dao.js';
import { BroadcastHandler, handlerFactory } from './handler.js';
import { broadcastDAOFactory } from './dao.js';

describe('Broadcast API', () => {
  let localstack: StartedLocalStackContainer;
  let ddb: DynamoDBClient;
  const testTableName = 'BroadcastTestTable';
  const apiGwClient = new ApiGatewayManagementApiClient();
  const mockApiGatewayClient = mockClient(apiGwClient);
  let joinGameDAO: JoinGameDAO;
  let handler: BroadcastHandler;

  beforeAll(async () => {
    localstack = await new LocalstackContainer(localstackContainer).start();
    ddb = new DynamoDBClient({
      endpoint: localstack.getConnectionUri(),
      region: 'us-east-1',
    });
    await createTable(ddb, testTableName);
    const broadcastDAO = broadcastDAOFactory(ddb, testTableName);
    handler = handlerFactory(apiGwClient, broadcastDAO);
    joinGameDAO = joinGameDAOFactory(ddb, testTableName);
  }, 60_000);
  afterAll(async () => {
    await localstack.stop();
  });
  beforeEach(() => {
    mockApiGatewayClient.reset();
  });
  it('should send an API Gateway message to all connections for a game', async () => {
    const gameId = await createGame(ddb, testTableName);
    await joinGameDAO(gameId, { name: 'Alice', character: 'Warrior' }, 'conn1');
    await joinGameDAO(gameId, { name: 'Bob', character: 'Mage' }, 'conn2');
    await joinGameDAO(gameId, { name: 'Charlie', character: 'Rogue' }, 'conn3');

    await handler({
      id: 'event1',
      version: '1.0',
      'detail-type': 'GAME_EVENT',
      detail: {
        gameId,
      },
      account: '123456789012',
      source: 'test.source',
      time: new Date().toISOString(),
      region: 'us-east-1',
      resources: [],
    });
    expect(mockApiGatewayClient).toHaveReceivedCommandTimes(
      PostToConnectionCommand,
      3,
    );
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn1',
      },
    );
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn2',
      },
    );
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn3',
      },
    );
  });
  it('should only send to connections for the specified game', async () => {
    const gameId1 = await createGame(ddb, testTableName);
    const gameId2 = await createGame(ddb, testTableName);
    await joinGameDAO(
      gameId1,
      { name: 'Alice', character: 'Warrior' },
      'conn1',
    );
    await joinGameDAO(gameId2, { name: 'Bob', character: 'Mage' }, 'conn2');
    await handler({
      id: 'event2',
      version: '1.0',
      'detail-type': 'GAME_EVENT',
      detail: {
        gameId: gameId1,
      },
      account: '123456789012',
      source: 'test.source',
      time: new Date().toISOString(),
      region: 'us-east-1',
      resources: [],
    });
    expect(mockApiGatewayClient).toHaveReceivedCommandTimes(
      PostToConnectionCommand,
      1,
    );
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn1',
      },
    );
    expect(mockApiGatewayClient).not.toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn2',
      },
    );
  });
});
