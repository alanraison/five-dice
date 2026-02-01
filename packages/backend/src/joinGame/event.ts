import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import logger from '../logger.js';
import { Player } from '../types.js';

export interface PlayerJoinedEvent {
  gameId: string;
  newPlayer: Player;
  allPlayers: Array<Player>;
}

export type Queuer = (message: PlayerJoinedEvent) => Promise<void>;

export function queuerFactory(
  eventBridgeClient: EventBridgeClient,
  eventBusName: string,
) {
  return async function queuer(message: PlayerJoinedEvent) {
    const res = await eventBridgeClient.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: eventBusName,
            DetailType: 'player-joined',
            Detail: JSON.stringify(message),
            Resources: [message.gameId],
            Source: 'five-dice-wsapi',
          },
        ],
      }),
    );
    logger.debug(res);
  };
}
