import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import joinGameDAOFactory from './dao';

jest.mock('@aws-sdk/client-dynamodb');

describe('JoinGameDAO', () => {
  const mockDynamoDBClient = new DynamoDBClient({});
  const mockDao = joinGameDAOFactory(mockDynamoDBClient, '');

  it('should save the player to the database', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockReturnValueOnce({
      Attributes: {
        Ttl: { N: '1234' },
        Players: { SS: ['player1'] },
      },
    });
    await mockDao('game1', 'player1', 'conn1');
    expect(mockDynamoDBClient.send).toHaveBeenCalled();
  });

  it('should return an error if the database write fails', async () => {
    (mockDynamoDBClient.send as jest.Mock).mockRejectedValue(
      new Error('Some Error')
    );
    await expect(mockDao('game2', 'player2', 'conn2')).rejects.toThrowError(
      'Some Error'
    );
  });
});
