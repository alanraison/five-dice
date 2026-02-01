import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

export type Queuer = (
  player: string,
  players: string[],
  gameId: string,
) => Promise<void>;

export function queuerFactory(
  eventBridgeClient: EventBridgeClient,
  eventBus: string,
): Queuer {
  return async function notify(
    player: string,
    players: string[],
    gameId: string,
  ) {
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
  };
}
