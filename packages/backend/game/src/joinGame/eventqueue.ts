import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

export interface PlayerJoinedEvent {
  gameId: string;
  newPlayer: string;
  allPlayers: Array<string>;
}

export type EventQueuer = (message: PlayerJoinedEvent) => Promise<void>;

export default function eventQueueFactory(
  eventBridgeClient: EventBridgeClient,
  eventBusName: string
) {
  return async function queuer(message: PlayerJoinedEvent) {
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
    console.log(JSON.stringify(res));
  } as EventQueuer;
}
