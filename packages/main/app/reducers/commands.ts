import { Action } from 'redux';

export const OPEN = 'open';
export const EXIT = 'exit';
export const START = 'start';
export enum all {
  OPEN,
  EXIT,
  START,
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

export interface StartGameCommand extends Action<typeof START> {
  gameId: string;
}

export function startGame(gameId: string): StartGameCommand {
  return {
    type: START,
    gameId,
  };
}
