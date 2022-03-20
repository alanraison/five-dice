import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({ endpoint: process.env.DYNAMO_ENDPOINT });
const table = process.env.TABLE_NAME;
if (!table) {
  throw new Error('Initialisation error: TABLE_NAME not found');
}

export async function gameExists(gameId?: string) {
  if (!gameId) {
    return false;
  }
  const result = await ddb.send(
    new GetItemCommand({
      TableName: table,
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
      TableName: table,
      Key: {
        PK: { S: `GAME#${gameId}` },
      },
      ProjectionExpression: '#characters.#player',
      ExpressionAttributeNames: {
        '#characters': 'Characters',
        '#player': name,
      },
    })
  );
  return !!result.Item?.Characters?.M?.[name]?.S;
}
