import { Player } from '~/types';
import { GameAction } from './actions';
import { PLAYER_JOINED, PLAYER_LEFT } from '../events';
import { EXIT } from './commands';

export function players(
  state: Array<Player> = [],
  action: GameAction
): Array<Player> {
  console.log(action);
  switch (action.type) {
    case PLAYER_JOINED:
      return [...action.allPlayers];
    case PLAYER_LEFT: {
      return [
        ...action.allPlayers.map((name) => ({
          name,
          character:
            state.find((player) => player.name === name)?.character ||
            'unknown',
        })),
      ];
    }
    case EXIT:
      return [];
    default:
      return state;
  }
}
