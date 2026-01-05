import joinGame, { UnsuccessfulJoinGameResponse } from './dao.js';
import queuer from './event.js';
import logger from '../logger.js';
import { JoinGameRequest } from './types.js';

interface APIGatewayWebsocketProxyEvent {
  body?: string;
  requestContext: {
    connectionId: string;
  };
  queryStringParameters: {
    [key: string]: string;
  };
}

export async function handler(event: APIGatewayWebsocketProxyEvent) {
  const parseResult = JoinGameRequest.safeParse(event.queryStringParameters);
  if (!parseResult.success) {
    return Promise.resolve({
      statusCode: 400,
      body: 'Missing gameId, name or character parameter in request',
    });
  }
  const { gameId: gameIdEnc, name, character } = parseResult.data;
  const gameId = gameIdEnc.replace(/-/g, '+').replace(/_/g, '/');
  logger.info(
    {
      name,
      connectionId: event.requestContext.connectionId,
    },
    'join game',
  );
  try {
    const player = { name, character };
    const joinGameResponse = await joinGame(
      gameId,
      player,
      event.requestContext.connectionId,
    );
    if (joinGameResponse instanceof UnsuccessfulJoinGameResponse) {
      return {
        statusCode: 400,
        body: joinGameResponse.reason,
      };
    }
    const { players } = joinGameResponse;
    await queuer({
      gameId,
      newPlayer: player,
      allPlayers: players,
    });
    logger.debug({ players });
    return {
      statusCode: 200,
      body: JSON.stringify({
        players,
      }),
    };
  } catch (err) {
    logger.error({ err });
    return Promise.resolve({
      statusCode: 500,
      body: err instanceof Error ? err.message : 'unknown error',
    });
  }
}
