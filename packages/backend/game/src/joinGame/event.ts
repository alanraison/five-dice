import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import logger from '../logger';

if (!process.env.EVENTBUS_NAME) {
  throw new Error('Initialisation Error: No Event Bus given');
}

const eventBusName = process.env.EVENTBUS_NAME;
const eventBridgeClient = new EventBridgeClient({});

export interface PlayerJoinedEvent {
  gameId: string;
  newPlayer: string;
  allPlayers: Array<string>;
}

export default async function queuer(message: PlayerJoinedEvent) {
  const res = await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: eventBusName,
          DetailType: 'player-joined',
          Detail: JSON.stringify(message),
          Source: 'five-dice-wsapi',
        },
      ],
    })
  );
  logger.debug(res);
}
