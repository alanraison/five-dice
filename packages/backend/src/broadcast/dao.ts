import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import logger from '../logger.js';

export type BroadcastDAO = {
  getConnectionsForGame(gameId: string): Promise<string[]>;
};

export function broadcastDAOFactory(
  ddb: DynamoDBClient,
  table: string,
): BroadcastDAO {
  return {
    getConnectionsForGame: async function getConnectionsForGame(
      gameId: string,
    ) {
      const result = await ddb.send(
        new QueryCommand({
          TableName: table,
          IndexName: 'GSI1',
          KeyConditionExpression: '#pk = :gameId AND begins_with(#sk, :conn)',
          ExpressionAttributeNames: {
            '#pk': 'GSI1PK',
            '#sk': 'GSI1SK',
            '#cid': 'CID',
          },
          ExpressionAttributeValues: {
            ':gameId': { S: gameId },
            ':conn': { S: 'CONN#' },
          },
          ProjectionExpression: '#cid',
        }),
      );
      logger.info(result);
      return (
        result.Items?.map((i) => i.CID?.S).filter((x) => x !== undefined) ?? []
      );
    },
  };
}
