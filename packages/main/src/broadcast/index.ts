import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { EventBridgeEvent } from 'aws-lambda';
import logger from '../logger';
import { getConnectionsForGame } from './dao';

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation Error: WSAPI_URL not defined');
}

interface GameEvent {
  gameId: string;
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
              })
            ),
          })
        )
      )
    );
    logger.debug(results);
  } catch (e) {
    logger.error(e);
    throw e;
  }
}
