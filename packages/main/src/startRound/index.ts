import { EventBridgeEvent } from 'aws-lambda';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { randomInt } from 'crypto';
import { getConnectionsForGame, saveDice } from './dao';
import { Attributes } from '../getConnectionsForGame';
import { ConnectionData, DiceData } from './types';
import logger from '../logger';

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation error: WSAPI_URL not set');
}
const apiGwClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WSAPI_URL,
});

interface GameEvent {
  gameId: string;
}

function rollNDice(number: number): Array<number> {
  return new Array(number).fill(0).map(() => randomInt(2, 8));
}

function diceByConnectionAndPlayer(
  connections: Array<ConnectionData>
): DiceData {
  return connections.reduce(
    (acc, cur) => {
      const dice = rollNDice(cur.DiceCount);
      logger.debug(
        {
          connection: cur.CID,
          diceCount: cur.DiceCount,
          player: cur.Player,
          dice,
        },
        'rolling dice'
      );
      return {
        byConnection: {
          ...acc.byConnection,
          [cur.CID]: dice,
        },
        byPlayer: {
          ...acc.byPlayer,
          [cur.Player]: dice,
        },
      };
    },
    { byConnection: {}, byPlayer: {} }
  );
}

export async function handler(
  event: EventBridgeEvent<'game-started', GameEvent>
) {
  const gameId = event.detail.gameId;
  // get connections for game
  const connections: Array<ConnectionData> =
    (await getConnectionsForGame(gameId, [
      Attributes.cid,
      Attributes.diceCount,
      Attributes.player,
    ]).then((result) =>
      result.Items?.map(({ CID, DiceCount, Player }) => {
        if (!(CID.S && Player.S)) {
          throw Error(
            `Invalid Player data: connection id ${CID.S}, Player Name ${Player.S}`
          );
        }
        return {
          CID: CID.S,
          DiceCount: parseInt(DiceCount.N || '0', 10),
          Player: Player.S,
        };
      })
    )) || [];
  // for each connection
  logger.debug(connections);
  const diceByConnection = diceByConnectionAndPlayer(connections);
  logger.debug(diceByConnection, 'dice by connection and player');
  // update connection and game
  const nextPlayer = await saveDice(gameId, diceByConnection); // check for errors!
  // notify connection
  const sendDiceToPlayers = await Promise.allSettled(
    Object.entries(diceByConnection.byConnection).map(([conn, dice]) =>
      apiGwClient.send(
        new PostToConnectionCommand({
          ConnectionId: conn,
          Data: Buffer.from(
            JSON.stringify({
              event: 'round-started',
              dice,
              firstPlayer: nextPlayer,
            })
          ),
        })
      )
    )
  );
  logger.debug(sendDiceToPlayers, 'sendDiceToPlayers');
  return {
    statusCode: 200,
  };
}
