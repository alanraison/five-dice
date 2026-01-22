import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export async function createGame(
  client: DynamoDBClient,
  tableName: string,
  gameId: string,
) {
  const putCommand = new PutItemCommand({
    TableName: tableName,
    Item: {
      PK: { S: `GAME#${gameId}` },
      T: { S: 'Game' },
      GID: { S: gameId },
      Status: { S: 'Pending' },
      Characters: { M: {} },
      GSI2PK: { S: gameId },
      GSI2SK: { S: 'GAME' },
    },
    ConditionExpression: 'attribute_not_exists(#pk)',
    ExpressionAttributeNames: {
      '#pk': 'PK',
    },
  });
  await client.send(putCommand);
}
