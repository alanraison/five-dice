import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  joinGameDAOFactory,
  type UnsuccessfulJoinGameResponse,
} from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';

const client = new DynamoDBClient();
const tableName = 'TestTable';
const joinGame = joinGameDAOFactory(client, tableName);

describe('JoinGameDAO', () => {
  const mockDynamoDBClient = mockClient(client);

  beforeEach(() => {
    mockDynamoDBClient.reset();
    vi.resetAllMocks();
  });

  it('should return an unsuccessful response if the game does not exist or is not joinable', async () => {
    const query = {
      Key: {
        PK: { S: 'GAME#game1' },
      },
    };
    mockDynamoDBClient.on(UpdateItemCommand, query).rejects(
      new ConditionalCheckFailedException({
        $metadata: {},
        message: 'The conditional request failed',
      }),
    );
    const response = await joinGame(
      'game1',
      { name: 'player1', character: 'character' },
      'conn1',
    );
    expect(mockDynamoDBClient).toHaveReceivedCommandWith(
      UpdateItemCommand,
      query,
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
    mockDynamoDBClient
      .on(UpdateItemCommand)
      .resolves({
        Attributes: {
          Characters: {
            M: {
              player1: { S: 'c' },
              player2: { S: 'd' },
              player3: { S: 'e' },
            },
          },
        },
      })
      .on(PutItemCommand)
      .resolves({});

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
