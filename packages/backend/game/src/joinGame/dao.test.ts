import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import joinGameDAOFactory from './dao';

jest.mock('@aws-sdk/client-dynamodb');

describe('JoinGameDAO', () => {
  const mockDynamoDBClient = new DynamoDBClient({});
  const mockDao = joinGameDAOFactory(mockDynamoDBClient, '');

  it('should save the player to the database', async () => {
    await mockDao('game1', 'player1');
    expect(mockDynamoDBClient.send).toHaveBeenCalled();
  });
});
