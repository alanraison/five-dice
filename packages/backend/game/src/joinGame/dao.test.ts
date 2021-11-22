/* eslint-disable max-classes-per-file */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import pino from 'pino';
import joinGame, {
  SuccessfulJoinGameResponse,
  UnsuccessfulJoinGameResponse,
} from './dao';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('../logger', () => pino({ enabled: false }));

class MockConditionalCheckFailedException extends Error {
  name: string = 'ConditionalCheckFailedException';

  constructor() {
    super('ConditionalCheckFailedException');
  }
}

describe('JoinGameDAO', () => {
  const mockDynamoDBClient = new DynamoDBClient({});

  it('should return an unsuccessful response if the game does not exist', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
      new MockConditionalCheckFailedException()
    );
    const response = await joinGame('game1', 'player1', 'conn1');
    expect(response).toMatchObject<UnsuccessfulJoinGameResponse>({
      reason: 'Game not joinable',
    });
  });
  it('should return an unsuccessful response if the game is full', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
      new MockConditionalCheckFailedException()
    );
    const response = await joinGame('game1', 'player1', 'conn1');
    expect(response).toMatchObject<UnsuccessfulJoinGameResponse>({
      reason: 'Game not joinable',
    });
  });
  it('should return an error if the database write fails', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
      new Error('Some Error')
    );
    await expect(joinGame('game2', 'player2', 'conn2')).rejects.toThrowError(
      'Some Error'
    );
  });
  it('should return the current player list if the player joins successfully', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockResolvedValueOnce({
      Attributes: {
        Players: {
          SS: ['player1', 'player2', 'player3'],
        },
      },
    });
    await expect(
      joinGame('game1', 'player3', 'conn3')
    ).resolves.toEqual<SuccessfulJoinGameResponse>({
      players: ['player1', 'player2', 'player3'],
    });
  });
});
