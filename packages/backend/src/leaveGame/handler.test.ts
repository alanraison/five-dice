import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBClient,
  DeleteItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { handler } from './handler.js';

vi.mock('../logger.js');
const mockDynamoDBClient = mockClient(DynamoDBClient);
const mockEventBridgeClient = mockClient(EventBridgeClient);

describe('leaveGameHandler', () => {
  beforeEach(() => {
    mockDynamoDBClient.reset();
    mockEventBridgeClient.reset();
    vi.resetAllMocks();
  });

  it('should return an error if the game does not exist', async () => {
    // Mock DeleteItemCommand to return no GID attribute (simulating game not found)
    mockDynamoDBClient.on(DeleteItemCommand).resolves({
      Attributes: {
        Player: { S: 'player1' },
        // GID is missing, which means the connection didn't have a game
      },
    });

    await expect(() =>
      handler({
        requestContext: {
          connectionId: 'test-connection-id',
        },
      }),
    ).rejects.toThrow('Game ID not found');
  });

  it('should return an error if the player is not found', async () => {
    // Mock DeleteItemCommand to return no Player attribute
    mockDynamoDBClient.on(DeleteItemCommand).resolves({
      Attributes: {
        GID: { S: 'game123' },
        // Player is missing
      },
    });

    await expect(() =>
      handler({
        requestContext: {
          connectionId: 'test-connection-id',
        },
      }),
    ).rejects.toThrow('Player not found');
  });

  it('should successfully remove player from game and send event', async () => {
    // Mock DeleteItemCommand to return both GID and Player
    mockDynamoDBClient
      .on(DeleteItemCommand)
      .resolves({
        Attributes: {
          GID: { S: 'game123' },
          Player: { S: 'player1' },
        },
      })
      .on(UpdateItemCommand)
      .resolves({
        Attributes: {
          Characters: {
            M: {
              player2: { S: 'character2' },
              player3: { S: 'character3' },
            },
          },
        },
      });

    mockEventBridgeClient.on(PutEventsCommand).resolves({});

    const result = await handler({
      requestContext: {
        connectionId: 'test-connection-id',
      },
    });

    expect(result).toEqual({ statusCode: 200 });
  });
});
