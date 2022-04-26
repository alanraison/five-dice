import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { EventBridgeEvent } from 'aws-lambda';
import { randomInt } from 'crypto';
import logger from '../logger';
import { getConnectionsForGame, saveDice } from './dao';
import { ConnectionData, DiceData } from './types';

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
  const connections = (await getConnectionsForGame(gameId)) || [];
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
