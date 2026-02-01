import logger from '../logger.js';
import { LeaveGameDAO } from './dao.js';
import { Queuer } from './event.js';

export interface APIGatewayWebsocketProxyEvent {
  requestContext: {
    connectionId: string;
  };
}

export type LeaveGameHandler = (
  event: APIGatewayWebsocketProxyEvent,
) => Promise<{
  statusCode: number;
}>;

export function handlerFactory(leaveGameDAO: LeaveGameDAO, queuer: Queuer): LeaveGameHandler {
  return async (event: APIGatewayWebsocketProxyEvent) => {
    logger.info({
      msg: 'Handling disconnect',
      connectionId: event.requestContext.connectionId,
    });

    const { gameId, player } = await leaveGameDAO.deleteConnection(
      event.requestContext.connectionId,
    );

    const players = await leaveGameDAO.removePlayerFromGame(gameId, player);

    await queuer(player, players, gameId);
    return {
      statusCode: 200,
    };
  };
}
