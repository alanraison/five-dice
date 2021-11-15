import { JoinGameDAO } from './dao';
import { EventQueuer } from './eventqueue';

export interface APIGatewayWebsocketProxyEvent {
  body?: string;
  requestContext: {
    connectionId: string;
  };
  queryStringParameters: {
    [key: string]: string;
  };
}

export default function joinGameHandlerFactory(
  joinGameDAO: JoinGameDAO,
  queuer: EventQueuer
) {
  return async function joinGameHandler(event: APIGatewayWebsocketProxyEvent) {
    const { gameId, name } = event.queryStringParameters;
    if (!(gameId && name)) {
      return Promise.resolve({
        statusCode: 400,
        body: 'Missing gameId or name parameter in request',
      });
    }
    try {
      const players = await joinGameDAO(
        gameId,
        name,
        event.requestContext.connectionId
      );
      await queuer({
        gameId,
        newPlayer: name,
        allPlayers: players,
      });
      console.log(JSON.stringify({ players }));
      return {
        statusCode: 204,
        body: JSON.stringify({
          players,
        }),
      };
    } catch (e) {
      console.error(JSON.stringify(e));
      return Promise.resolve({
        statusCode: 500,
        body: e instanceof Error ? e.message : 'unknown error',
      });
    }
  };
}
