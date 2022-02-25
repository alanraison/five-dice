import { Action } from 'redux';
import { Player } from '~/types';
import { InProgressState, PendingState } from './state';
import { GameAction } from './actions';
import { GAME_STARTED, PLAYER_JOINED, PLAYER_LEFT } from './events';
import { EXIT } from './commands';

export function state(state: string | undefined, action: Action<any>): string {
  switch (action.type) {
    case GAME_STARTED: {
      return InProgressState;
    }
    default:
      return state || PendingState;
  }
}

export function players(
  state: Array<Player> | undefined,
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
            (state || []).find((player) => player.name === name)?.character ||
            'unknown',
        })),
      ];
    }
    case EXIT:
      return [];
    default:
      return state || [];
  }
}
