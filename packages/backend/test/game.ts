import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Status } from '../src/status.js';
import { randomUUID } from 'node:crypto';

export async function createGame(
  client: DynamoDBClient,
  tableName: string,
) {
  const gameId = randomUUID().replace(/-/g, '').slice(0, 8);
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
  return gameId;
}
