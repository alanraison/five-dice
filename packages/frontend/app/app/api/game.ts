import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({});

export async function gameExists(gameId?: string) {
  if (!gameId) {
    return false;
  }
  const result = await ddb.send(
    new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: { S: `GAME#${gameId}` },
      },
    })
  );
  return !!result.Item;
}

export async function nameTaken(gameId: string, name: string) {
  const result = await ddb.send(
    new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: { S: `GAME#${gameId}` },
      },
      ProjectionExpression: '#players',
      ExpressionAttributeNames: {
        '#players': 'Players',
      },
    })
  );
  return result.Item?.Players?.SS?.includes(name);
}
