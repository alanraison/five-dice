import * as events from './events';
import * as commands from './commands';
import { Action } from 'redux';

const MyTurnStarted = 'my-turn-started';

export interface StartMyTurnAction extends Action<typeof MyTurnStarted> {}
export const startMyTurn: () => StartMyTurnAction = () => ({
  type: MyTurnStarted,
});

export type GameAction =
  | events.GameStartedAction
  | events.PlayerJoinedAction
  | events.PlayerLeftAction
  | events.RoundStartedAction
  | commands.OpenCommand
  | commands.ExitCommand
  | commands.StartGameCommand
  | commands.BidCommand
  | StartMyTurnAction;
