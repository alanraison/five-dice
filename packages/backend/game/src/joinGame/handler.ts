/* eslint-disable import/prefer-default-export */
import joinGame, { UnsuccessfulJoinGameResponse } from './dao';
import queuer from './event';
import logger from '../logger';

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
  const { gameId, name } = event.queryStringParameters;
  if (!(gameId && name)) {
    return Promise.resolve({
      statusCode: 400,
      body: 'Missing gameId or name parameter in request',
    });
  }
  logger.info({
    msg: 'join game',
    name,
    connectionId: event.requestContext.connectionId,
  });
  try {
    const joinGameResponse = await joinGame(
      gameId,
      name,
      event.requestContext.connectionId
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
      newPlayer: name,
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
