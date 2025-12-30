import { Player } from '~/types';
import { GameAction } from './actions';
import { OPEN } from './commands';

const defaultPlayer = {
  name: 'UNKNOWN',
  character: '#none',
};

export function player(
  state: Player = defaultPlayer,
  action: GameAction
): Player {
  switch (action.type) {
    case OPEN:
      return {
        name: action.name,
        character: action.character,
      };
    default:
      return state;
  }
}
