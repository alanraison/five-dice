/* eslint-disable import/prefer-default-export */
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { EventBridgeEvent } from 'aws-lambda';
import getConnectionsForGame from './dao';
import logger from '../logger';

if (!process.env.WSAPI_URL) {
  throw new Error('Initialisation Error: WSAPI_URL not defined');
}

interface PlayerJoinedEvent {
  gameId: string;
  newPlayer: string;
  allPlayers: Array<string>;
}

const apiGwClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WSAPI_URL,
});

export async function handler(
  event: EventBridgeEvent<string, PlayerJoinedEvent>
) {
  try {
    const connections = await getConnectionsForGame(event.detail.gameId);
    const results = await Promise.all(
      connections.map((c) =>
        apiGwClient.send(
          new PostToConnectionCommand({
            ConnectionId: c,
            Data: Buffer.from(
              JSON.stringify({
                type: event['detail-type'],
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
