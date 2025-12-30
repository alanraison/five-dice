// Incoming Server Events
import { z } from 'zod';

export const PLAYER_JOINED = 'player-joined';
export const PLAYER_LEFT = 'player-left';
export const GAME_STARTED = 'game-started';
export const ROUND_STARTED = 'round-started';
export const BID_INCREASED = 'bid-increased';
export const CHALLENGE_RESULT = 'challenge-result';
export const ERROR = 'error';

interface Event<T> {
  event: T;
}

const player = z.object({
  name: z.string(),
  character: z.string(),
});
export const playerJoinedEvent = z.object({
  event: z.literal(PLAYER_JOINED),
  allPlayers: z.array(player),
  newPlayer: player,
});
export type PlayerJoinedEvent = z.infer<typeof playerJoinedEvent>;

export const playerLeftEvent = z.object({
  event: z.literal(PLAYER_LEFT),
  player: z.string(),
  allPlayers: z.array(z.string()),
});

export type PlayerLeftEvent = z.infer<typeof playerLeftEvent>;

export interface GameStartedEvent extends Event<typeof GAME_STARTED> {
  startedBy: string;
}

const gameStartedEvent = z.object({
  event: z.literal(GAME_STARTED),
  startedBy: z.string(),
});

const roundStartedEvent = z.object({
  event: z.literal(ROUND_STARTED),
  dice: z.array(z.number()),
  firstPlayer: z.string(),
});
export type RoundStartedEvent = z.infer<typeof roundStartedEvent>;

const bidIncreasedEvent = z.object({
  event: z.literal(BID_INCREASED),
  q: z.number(),
  v: z.number(),
  bidder: z.string(),
  nextPlayer: z.string(),
});
export type BidIncreasedEvent = z.infer<typeof bidIncreasedEvent>;

const challengeResult = z.object({
  event: z.literal(CHALLENGE_RESULT),
  counts: z.record(z.array(z.number())),
  loser: z.string(),
  bid: z.object({
    q: z.number(),
    v: z.number(),
  }),
  bidder: z.string(),
  challenger: z.string(),
});
export type ChallengeResultEvent = z.infer<typeof challengeResult>;

const errorEvent = z.object({
  event: z.literal('error'),
  message: z.string(),
});
export type ErrorEvent = z.infer<typeof errorEvent>;

const union = z.discriminatedUnion('event', [
  playerJoinedEvent,
  playerLeftEvent,
  gameStartedEvent,
  roundStartedEvent,
  bidIncreasedEvent,
  challengeResult,
  errorEvent,
]);

export interface GameEvents {
  PLAYER_JOINED: PlayerJoinedEvent;
  PLAYER_LEFT: PlayerLeftEvent;
  GAME_STARTED: GameStartedEvent;
  ROUND_STARTED: RoundStartedEvent;
  BID_INCREASED: BidIncreasedEvent;
  CHALLENGE_RESULT: ChallengeResultEvent;
  ERROR: ErrorEvent;
}

export function parseToEvent<
  K extends keyof GameEvents,
  T extends { event: K }
>({ event, ...rest }: T): z.infer<typeof union> | undefined {
  console.debug(`parsing event ${event}`);
  const ev = {
    event,
    ...rest,
  };
  switch (event) {
    case PLAYER_JOINED:
      console.debug('parsing player joined');
      return playerJoinedEvent.parse(ev);
    case PLAYER_LEFT:
      console.debug('parsing player left');
      return playerLeftEvent.parse(ev);
    case GAME_STARTED:
      console.debug('parsing game started');
      return gameStartedEvent.parse(ev);
    case ROUND_STARTED:
      console.debug('parsing round started');
      return roundStartedEvent.parse(ev);
    case BID_INCREASED:
      return bidIncreasedEvent.parse(ev);
    case CHALLENGE_RESULT:
      return challengeResult.parse(ev);
    case ERROR:
      return errorEvent.parse(ev);
    default:
      console.warn(`event not recognised: ${event}`);
      return undefined;
  }
}
