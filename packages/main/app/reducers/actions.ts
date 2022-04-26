import * as events from '../events';
import * as commands from './commands';
import { Action } from 'redux';

export const MY_TURN_STARTED = 'my-turn-started';
export const DISMISS_RESULT = 'dismiss-result';

export interface StartMyTurnAction extends Action<typeof MY_TURN_STARTED> {}
export const startMyTurn: () => StartMyTurnAction = () => ({
  type: MY_TURN_STARTED,
});
export interface DismissResultAction extends Action<typeof DISMISS_RESULT> {}
export const dismissResult: () => DismissResultAction = () => ({
  type: DISMISS_RESULT,
});

export type GameAction =
  | commands.OpenCommand
  | commands.ExitCommand
  | commands.StartGameCommand
  | commands.BidCommand
  | commands.ChallengeCommand
  | StartMyTurnAction
  | DismissResultAction;
