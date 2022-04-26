import { Action } from 'redux';

export const OPEN = 'open';
export const EXIT = 'exit';
export const START = 'start';
export const BID = 'bid';
export const CHALLENGE = 'challenge';
export enum all {
  OPEN,
  EXIT,
  START,
  BID,
}

export interface OpenCommand extends Action<typeof OPEN> {
  wsUrl: string;
  gameId: string;
  name: string;
  character: string;
}

export function open(
  wsUrl: string,
  gameId: string,
  name: string,
  character: string
): OpenCommand {
  return {
    type: OPEN,
    wsUrl,
    gameId,
    name,
    character,
  };
}

export interface ExitCommand extends Action<typeof EXIT> {}

export function exit(): ExitCommand {
  return {
    type: EXIT,
  };
}

export interface StartGameCommand extends Action<typeof START> {}

export function startGame(): string {
  return JSON.stringify({
    type: START,
  });
}

export interface BidCommand extends Action<typeof BID> {
  q: number;
  v: number;
}

export function bid(q: number, v: number): BidCommand {
  return {
    type: BID,
    q,
    v,
  };
}

export interface ChallengeCommand extends Action<typeof CHALLENGE> {}

export function challenge(): ChallengeCommand {
  return {
    type: CHALLENGE,
  };
}
