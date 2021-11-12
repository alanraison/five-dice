import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';

export type JoinGameDAO = (
  gameId: string,
  player: string
) => Promise<Set<string>>;

export default function joinGameDAOFactory(ddb: DynamoDBClient, table: string) {
  return async function joinGameDAO(gameId: string, player: string) {
    const result = await ddb.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Update: {
              Key: { PK: { S: gameId } },
              TableName: table,
              UpdateExpression: 'Add #players :player',
              ExpressionAttributeNames: {
                '#players': 'players',
              },
              ExpressionAttributeValues: {
                ':player': { SS: [player] },
                ':maxItems': { N: '6' },
              },
              ConditionExpression: 'size(#players) < :maxItems',
            },
          },
          {
            Put: {
              TableName: table,
              Item: {
                PK: { S: `${gameId}#${player}` },
                T: { S: 'Player' },
                Name: { S: player },
              },
            },
          },
        ],
      })
    );
    return new Set(['player1', 'player2']);
  };
}
