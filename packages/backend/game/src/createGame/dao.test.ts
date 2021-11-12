import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import createGameDAOFactory from './dao';

jest.mock('@aws-sdk/client-dynamodb');

describe('CreateGameDAO', () => {
  const mockDynamoDBClient = new DynamoDBClient({});
  const dao = createGameDAOFactory(mockDynamoDBClient, 'MockTable');

  it('should save a game id to the database', async () => {
    await dao('name');
    expect(mockDynamoDBClient.send).toHaveBeenCalled();
  });
  it('should retry if the game name is not unique', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockResolvedValue({});
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValueOnce({});
    await dao('name');
    expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(2);
  });
  it('should give up after 50 attempts', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
      new Error('test error')
    );
    await expect(dao('name')).rejects.toBeTruthy();
    expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(50);
  });
});
