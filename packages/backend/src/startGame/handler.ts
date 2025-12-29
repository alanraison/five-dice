import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import logger from '../logger';
import { checkGameDetails, updateGame } from './dao';

if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation error: EVENTBUS_NAME not set');
}

const eventBusClient = new EventBridgeClient({});
const eventBusName = process.env.EVENTBUS_NAME;

interface WebsocketActionEvent {
  requestContext: {
    connectionId: string;
  };
  body: string;
}

export async function handler(event: WebsocketActionEvent) {
  logger.debug(event);
  const gameId = JSON.parse(event.body).gameId;
  const { player, allPlayers } = await checkGameDetails(
    event.requestContext.connectionId,
    gameId
  );
  await updateGame(gameId, allPlayers);

  const response = await eventBusClient.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: eventBusName,
          DetailType: 'game-started',
          Detail: JSON.stringify({
            gameId,
            startedBy: player,
            players: allPlayers,
          }),
          Resources: [gameId],
          Source: 'five-dice-wsapi',
        },
      ],
    })
  );
  logger.info(response, 'publish game-started response');
  return {
    statusCode: 200,
  };
}
