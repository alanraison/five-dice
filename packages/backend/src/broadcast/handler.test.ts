import { describe, it, beforeEach, vi, expect } from 'vitest';
import { handlerFactory } from './handler.js';
import { broadcastDAOFactory } from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { type EventBridgeEvent } from 'aws-lambda';
import { type GameEvent } from './types.js';

describe('broadcast handler', () => {
  const apiGwClient = new ApiGatewayManagementApiClient();
  const mockApiGatewayClient = mockClient(apiGwClient);
  const getConnectionsForGame = vi.fn();
  const handler = handlerFactory(apiGwClient, { getConnectionsForGame });
  beforeEach(() => {
    vi.resetAllMocks();
    mockApiGatewayClient.reset();
  });
  it('should send messages to all connections', async () => {
    vi.mocked(getConnectionsForGame).mockResolvedValue(['conn1', 'conn2']);
    mockApiGatewayClient.on(PostToConnectionCommand).resolves({});
    const event: EventBridgeEvent<string, GameEvent & { someData: string }> = {
      detail: {
        gameId: 'game1',
        someData: 'value',
      },
      id: 'event1',
      version: '1.0',
      'detail-type': 'GAME_EVENT',
      source: 'test.source',
      account: '123456789012',
      time: '2024-01-01T00:00:00Z',
      region: 'us-east-1',
      resources: [],
    };
    await expect(handler(event)).resolves.toBeUndefined();
    expect(mockApiGatewayClient).toHaveReceivedCommandTimes(
      PostToConnectionCommand,
      2,
    );
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn1',
        Data: Buffer.from(
          JSON.stringify({
            event: 'GAME_EVENT',
            someData: 'value',
          }),
        ),
      },
    );
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn2',
        Data: Buffer.from(
          JSON.stringify({
            event: 'GAME_EVENT',
            someData: 'value',
          }),
        ),
      },
    );
  });
});
