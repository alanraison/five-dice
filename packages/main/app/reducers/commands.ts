import { Action } from 'redux';

export const OPEN = 'open';
export const EXIT = 'exit';
export const START = 'start';
export const BID = 'bid';
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

export function startGame(): StartGameCommand {
  return {
    type: START,
  };
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
