import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import joinGame, { type UnsuccessfulJoinGameResponse } from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';

vi.mock('../logger.js');

class MockConditionalCheckFailedException extends Error {
  name: string = 'ConditionalCheckFailedException';

  constructor() {
    super('ConditionalCheckFailedException');
  }
}

describe('JoinGameDAO', () => {
  const mockDynamoDBClient = mockClient(DynamoDBClient);

  beforeEach(() => {
    mockDynamoDBClient.reset();
    vi.resetAllMocks();
  });

  it('should return an unsuccessful response if the game does not exist or is not joinable', async () => {
    mockDynamoDBClient
      .on(UpdateItemCommand)
      .rejects(new MockConditionalCheckFailedException());
    const response = await joinGame(
      'game1',
      { name: 'player1', character: 'character' },
      'conn1',
    );
    expect(response).toMatchObject<UnsuccessfulJoinGameResponse>({
      reason: 'Game not joinable',
    });
  });

  it('should return an error if the database write fails with unexpected error', async () => {
    mockDynamoDBClient.on(UpdateItemCommand).rejects(new Error('Some Error'));
    await expect(() =>
      joinGame(
        'game2',
        {
          name: 'player2',
          character: 'character',
        },
        'conn2',
      ),
    ).rejects.toThrow('Some Error');
  });

  it('should return the current player list if the player joins successfully', async () => {
    mockDynamoDBClient.on(UpdateItemCommand).resolves({
      Attributes: {
        Characters: {
          M: {
            player1: { S: 'c' },
            player2: { S: 'd' },
            player3: { S: 'e' },
          },
        },
      },
    }).on(PutItemCommand).resolves({});

    await expect(
      joinGame('game1', { name: 'player3', character: 'e' }, 'conn3'),
    ).resolves.toEqual({
      players: [
        { name: 'player1', character: 'c' },
        { name: 'player2', character: 'd' },
        { name: 'player3', character: 'e' },
      ],
    });
  });
});
