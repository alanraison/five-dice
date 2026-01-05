import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { type EventBridgeEvent } from 'aws-lambda';
import logger from '../logger.js';
import { getConnectionsForGame } from './dao.js';
import { type GameEvent } from './types.js';

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation Error: WSAPI_URL not defined');
}

const apiGwClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WSAPI_URL,
});

export async function handler(event: EventBridgeEvent<string, GameEvent>) {
  try {
    const connections =
      (await getConnectionsForGame(event.detail.gameId)) || [];
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
}
