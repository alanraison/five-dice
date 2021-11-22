import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import logger from '../logger';

if (!process.env.TABLE_NAME) {
  throw new Error('Initialisation Error: TABLE_NAME not defined');
}

const ddb = new DynamoDBClient({});
const table = process.env.TABLE_NAME;

export default async function getConnectionsForGame(gameId: string) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: table,
      IndexName: 'Connections',
      KeyConditions: {
        GSI1PK: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [{ S: gameId }],
        },
        GSI1SK: {
          ComparisonOperator: 'BEGINS_WITH',
          AttributeValueList: [{ S: 'CONN#' }],
        },
      },
      AttributesToGet: ['CID'],
    })
  );
  logger.info(result);
  return result.Items?.map((item) => item.CID.S) || [];
}
