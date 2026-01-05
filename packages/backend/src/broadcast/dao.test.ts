import { beforeEach, describe, expect, it } from 'vitest';
import { getConnectionsForGame } from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

describe('BroadcastDAO', () => {
  const mockDynamoDBClient = mockClient(DynamoDBClient);
  beforeEach(() => {
    mockDynamoDBClient.reset();
  });
  describe('getConnectionsForGame', () => {
    it('should get the connections for a game from the database', async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: [
          { CID: { S: 'conn1' } },
          { CID: { S: 'conn2' } },
        ],
      });
      const connections = await getConnectionsForGame('game1');
      expect(connections).toEqual(['conn1', 'conn2']);
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(QueryCommand, {
        IndexName: 'GSI1',
        KeyConditionExpression: '#pk = :gameId AND begins_with(#sk, :conn)',
        ExpressionAttributeNames: expect.objectContaining({
          '#pk': 'GSI1PK',
          '#sk': 'GSI1SK',
        }),
        ExpressionAttributeValues: expect.objectContaining({
          ':gameId': { S: 'game1' },
          ':conn': { S: 'CONN#' },
        }),
      });
    });
  });
});
