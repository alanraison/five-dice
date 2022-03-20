// Incoming Server Events

import { Action } from 'redux';
import { z } from 'zod';

export const PLAYER_JOINED = 'player-joined';
export const PLAYER_LEFT = 'player-left';
export const GAME_STARTED = 'game-started';
export const ROUND_STARTED = 'round-started';
export enum all {
  PLAYER_JOINED,
  PLAYER_LEFT,
  GAME_STARTED,
  ROUND_STARTED,
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

export function parseToAction<T extends { event: string }>({
  event,
  ...rest
}: T): Action | undefined {
  console.log(`parsing event ${event}`);
  const ev = {
    type: event,
    ...rest,
  };
  console.log(ev);
  switch (event) {
    case PLAYER_JOINED:
      console.log('parsing player joined');
      return playerJoinedAction.parse(ev);
    case PLAYER_LEFT:
      console.log('parsing player left');
      return playerLeftAction.parse(ev);
    case GAME_STARTED:
      console.log('parsing game started');
      return gameStartedAction.parse(ev);
    case ROUND_STARTED:
      console.log('parsing round started');
      return roundStartedAction.parse(ev);
    default:
      console.log('event not recognised');
      return undefined;
  }
}
