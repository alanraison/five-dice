import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import logger from '../logger.js';
import { deleteConnection, removePlayerFromGame } from './dao.js';

if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation Error: no EVENTBUS_NAME set');
}
const eventBridgeClient = new EventBridgeClient({});
const eventBus = process.env.EVENTBUS_NAME;

interface APIGatewayWebsocketProxyEvent {
  requestContext: {
    connectionId: string;
  };
}

export async function handler(event: APIGatewayWebsocketProxyEvent) {
  logger.info({
    msg: 'Handling disconnect',
    connectionId: event.requestContext.connectionId,
  });

  const { gameId, player } = await deleteConnection(
    event.requestContext.connectionId,
  );

  const players = await removePlayerFromGame(gameId, player);

  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          DetailType: 'player-left',
          Detail: JSON.stringify({
            player,
            allPlayers: players,
            gameId,
          }),
          Resources: [gameId],
          Source: 'five-dice-wsapi',
          EventBusName: eventBus,
        },
      ],
    }),
  );
  return {
    statusCode: 200,
  };
}
