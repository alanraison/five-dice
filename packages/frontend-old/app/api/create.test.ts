import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import pino from 'pino';
import { createGame } from './create';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('~/logger', () => pino({ enabled: false }));

class MockConditionalCheckFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConditionalCheckFailedException';
  }
}

describe('CreateGameDAO', () => {
  const mockDynamoDBClient = new DynamoDBClient({});

  it('should save a game id to the database', async () => {
    await createGame();
    expect(mockDynamoDBClient.send).toHaveBeenCalled();
  });
  it('should retry if the game name is not unique', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockResolvedValue({});
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValueOnce(
      new MockConditionalCheckFailedException('not unique')
    );
    await createGame();
    expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(2);
  });
  it('should give up after 50 attempts', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
      new MockConditionalCheckFailedException('test error')
    );
    await expect(createGame()).rejects.toBeTruthy();
    expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(50);
  });
  it('should throw an error on other exceptions', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
      new Error('some other error')
    );
    await expect(createGame()).rejects.toThrowError('some other error');
    expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(1);
  });
});
