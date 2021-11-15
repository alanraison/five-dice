import {
  BatchWriteItemCommand,
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';

export type JoinGameDAO = (
  gameId: string,
  player: string,
  connectionId: string
) => Promise<Array<string>>;

export default function joinGameDAOFactory(ddb: DynamoDBClient, table: string) {
  return async function joinGameDAO(
    gameId: string,
    player: string,
    connectionId: string
  ) {
    const result = await ddb.send(
      new UpdateItemCommand({
        Key: { PK: { S: `GAME#${gameId}` } },
        TableName: table,
        UpdateExpression: 'Add #players :player, #conns :conn',
        ExpressionAttributeNames: {
          '#players': 'Players',
          '#conns': 'Conns',
          '#pk': 'PK',
          '#status': 'Status',
        },
        ExpressionAttributeValues: {
          ':player': { SS: [player] },
          ':conn': { SS: [connectionId] },
          ':maxItems': { N: '6' },
          ':pending': { S: 'Pending' },
        },
        ConditionExpression:
          'attribute_exists(#pk) ' +
          'AND #status = :pending ' +
          'AND (attribute_not_exists(#players) OR size(#players) < :maxItems)',
        ReturnValues: 'ALL_NEW',
      })
    );

    await ddb.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [table]: [
            {
              PutRequest: {
                Item: {
                  PK: { S: `PLAYER#${gameId}#${player}` },
                  // SK: { S: gameId },
                  T: { S: 'Player' },
                  Name: { S: player },
                  Conn: { S: connectionId },
                  ...(result.Attributes?.Ttl.N
                    ? { Ttl: { N: result.Attributes.Ttl.N } }
                    : {}),
                },
              },
            },
            {
              PutRequest: {
                Item: {
                  PK: { S: `GAME#${gameId}#CONN#${connectionId}` },
                  // SK: { S: `GAME#${gameId}#CONN#${connectionId}` },
                  T: { S: 'Connection' },
                  Conn: { S: connectionId },
                  Player: { S: player },
                  ...(result.Attributes?.Ttl.N
                    ? { Ttl: { N: result.Attributes.Ttl.N } }
                    : {}),
                },
              },
            },
          ],
        },
      })
    );

    return result.Attributes?.Players.SS || [];
  } as JoinGameDAO;
}
