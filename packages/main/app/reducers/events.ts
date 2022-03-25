// Incoming Server Events

import { Action } from 'redux';
import { z } from 'zod';

export const PLAYER_JOINED = 'player-joined';
export const PLAYER_LEFT = 'player-left';
export const GAME_STARTED = 'game-started';
export const ROUND_STARTED = 'round-started';
export const BID_INCREASED = 'bid-increased';
export const ERROR = 'error';
export enum all {
  PLAYER_JOINED,
  PLAYER_LEFT,
  GAME_STARTED,
  ROUND_STARTED,
  BID_INCREASED,
  ERROR,
}

const player = z.object({
  name: z.string(),
  character: z.string(),
});
export const playerJoinedAction = z.object({
  type: z.literal(PLAYER_JOINED),
  allPlayers: z.array(player),
  newPlayer: player,
});
export type PlayerJoinedAction = z.infer<typeof playerJoinedAction>;

export const playerLeftAction = z.object({
  type: z.literal(PLAYER_LEFT),
  player: z.string(),
  allPlayers: z.array(z.string()),
});

export type PlayerLeftAction = z.infer<typeof playerLeftAction>;

export interface GameStartedAction extends Action<typeof GAME_STARTED> {
  startedBy: string;
}

const gameStartedAction = z.object({
  type: z.literal(GAME_STARTED),
  startedBy: z.string(),
});

const roundStartedAction = z.object({
  type: z.literal(ROUND_STARTED),
  dice: z.array(z.number()),
  firstPlayer: z.string(),
});
export type RoundStartedAction = z.infer<typeof roundStartedAction>;

const bidIncreasedAction = z.object({
  type: z.literal(BID_INCREASED),
  q: z.number(),
  v: z.number(),
  bidder: z.string(),
  nextPlayer: z.string(),
});
export type BidIncreasedAction = z.infer<typeof bidIncreasedAction>;

const errorAction = z.object({
  type: z.literal('error'),
  message: z.string(),
});
export type ErrorAction = z.infer<typeof errorAction>;

export function parseToAction<T extends { event: string }>({
  event,
  ...rest
}: T): Action | undefined {
  console.debug(`parsing event ${event}`);
  const ev = {
    type: event,
    ...rest,
  };
  switch (event) {
    case PLAYER_JOINED:
      console.debug('parsing player joined');
      return playerJoinedAction.parse(ev);
    case PLAYER_LEFT:
      console.debug('parsing player left');
      return playerLeftAction.parse(ev);
    case GAME_STARTED:
      console.debug('parsing game started');
      return gameStartedAction.parse(ev);
    case ROUND_STARTED:
      console.debug('parsing round started');
      return roundStartedAction.parse(ev);
    case BID_INCREASED:
      return bidIncreasedAction.parse(ev);
    case ERROR:
      return errorAction.parse(ev);
    default:
      console.warn(`event not recognised: ${ev.type}`);
      return undefined;
  }
}
