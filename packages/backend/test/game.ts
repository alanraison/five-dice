import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Status } from '../src/status.js';

export async function createGame(
  client: DynamoDBClient,
  tableName: string,
  gameIdEnc: string,
) {
  const gameId = gameIdEnc.replace(/-/g, '+').replace(/_/g, '/');
  await client.send(
    new PutItemCommand({
      TableName: tableName,
      Item: {
        PK: { S: `GAME#${gameId}` },
        T: { S: 'Game' },
        GID: { S: gameId },
        Status: { S: Status.PENDING },
        Characters: { M: {} },
        GSI2PK: { S: gameId },
        GSI2SK: { S: 'GAME' },
      },
      ConditionExpression: 'attribute_not_exists(#pk)',
      ExpressionAttributeNames: {
        '#pk': 'PK',
      },
    }),
  );
}
