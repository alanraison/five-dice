import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

export type GetConnectionsForGameDAO = (
  gameId: string
) => Promise<Array<string>>;

export default function dao(ddb: DynamoDBClient, table: string) {
  return async function getConnectionsForGame(gameId: string) {
    const result = await ddb.send(
      new GetItemCommand({
        TableName: table,
        Key: { PK: { S: `GAME#${gameId}` } },
        AttributesToGet: ['Conns'],
      })
    );
    //   new QueryCommand({
    //     TableName: table,
    //     KeyConditionExpression: '#conn begins_with(:pk)',
    //     ExpressionAttributeNames: {
    //       '#conn': 'PK',
    //     },
    //     ExpressionAttributeValues: {
    //       ':pk': { S: `GAME#${gameId}#CONN` },
    //     },
    //     AttributesToGet: ['Conn'],
    //   })
    // );
    console.log(JSON.stringify(result));
    return result.Item?.Conns.SS || [];
  } as GetConnectionsForGameDAO;
}
