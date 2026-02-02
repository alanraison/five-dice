import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { type EventBridgeEvent } from 'aws-lambda';
import logger from '../logger.js';
import { BroadcastDAO } from './dao.js';
import { type GameEvent } from './types.js';

export type BroadcastHandler = (
  event: EventBridgeEvent<string, GameEvent>,
) => Promise<void>;

export function handlerFactory(
  apiGwClient: ApiGatewayManagementApiClient,
  broadcastDAO: BroadcastDAO,
): BroadcastHandler {
  return async function handler(event: EventBridgeEvent<string, GameEvent>) {
    try {
      const connections =
        (await broadcastDAO.getConnectionsForGame(event.detail.gameId)) || [];
      const results = await Promise.allSettled(
        connections.map((c) =>
          apiGwClient.send(
            new PostToConnectionCommand({
              ConnectionId: c,
              Data: Buffer.from(
                JSON.stringify({
                  event: event['detail-type'],
                  ...event.detail,
                  gameId: undefined,
                }),
              ),
            }),
          ),
        ),
      );
      logger.debug(results);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };
}
