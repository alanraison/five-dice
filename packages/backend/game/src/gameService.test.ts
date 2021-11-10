import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import GameService from './gameService';

jest.mock('@aws-sdk/client-dynamodb');

describe('GameService', () => {
  const mockDynamoDBClient = new DynamoDBClient({});
  const gameService = new GameService(mockDynamoDBClient, 'MockTable');

  describe('createGame', () => {
    it('should save a game id to the database', async () => {
      await gameService.createGame('name');
      expect(mockDynamoDBClient.send).toHaveBeenCalled();
    });
    it('should retry if the game name is not unique', async () => {
      (mockDynamoDBClient.send as jest.Mock).mockResolvedValue({});
      (mockDynamoDBClient.send as jest.Mock).mockRejectedValueOnce({});
      await gameService.createGame('name');
      expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(2);
    });
    it('should give up after 50 attempts', async () => {
      (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
        new Error('test error')
      );
      await expect(gameService.createGame('name')).rejects.toBeTruthy();
      expect(mockDynamoDBClient.send).toHaveBeenCalledTimes(50);
    });
  });
});
