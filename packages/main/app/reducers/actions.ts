import * as events from './events';
import * as commands from './commands';

export type GameAction =
  | events.GameStartedAction
  | events.PlayerJoinedAction
  | events.PlayerLeftAction
  | commands.OpenCommand
  | commands.ExitCommand
  | commands.StartGameCommand;
