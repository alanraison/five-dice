import {
  DeleteItemCommand,
  DynamoDBClient,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';

export interface LeaveGameDAO {
  deleteConnection: (connectionId: string) => Promise<{
    gameId: string;
    player: string;
  }>;
  removePlayerFromGame: (
    gameId: string,
    player: string,
  ) => Promise<Array<string>>;
}

export function leaveGameDAOFactory(ddb: DynamoDBClient, table: string): LeaveGameDAO {
  return {
    deleteConnection: async function deleteConnection(connectionId: string) {
      const result = await ddb.send(
        new DeleteItemCommand({
          TableName: table,
          Key: {
            PK: { S: `CONN#${connectionId}` },
          },
          ReturnValues: 'ALL_OLD',
        }),
      );
      const gameId = result.Attributes?.GID?.S;
      const player = result.Attributes?.Player?.S;

      if (!gameId) {
        throw new Error('Game ID not found');
      }
      if (!player) {
        throw new Error('Player not found');
      }

      return { gameId, player };
    },
    removePlayerFromGame: async function removePlayerFromGame(
      gameId: string,
      player: string,
    ) {
      const updateResult = await ddb.send(
        new UpdateItemCommand({
          TableName: table,
          Key: {
            PK: { S: `GAME#${gameId}` },
          },
          UpdateExpression: 'Remove #characters.#player',
          ExpressionAttributeNames: {
            '#characters': 'Characters',
            '#player': player,
          },
          ReturnValues: 'ALL_NEW',
        }),
      );
      return Object.keys(updateResult.Attributes?.Characters?.M || {});
    },
  };
}
