import { Action } from 'redux';
import { GameAction } from './actions';
import { GAME_STARTED } from './events';

export const PendingState = 'pending';
export const InProgressState = 'in-progress';
export const MyTurnState = 'my-turn';

export function state(
  state: string = PendingState,
  action: GameAction
): string {
  switch (action.type) {
    case GAME_STARTED: {
      return InProgressState;
    }
    default:
      return state;
  }
}
