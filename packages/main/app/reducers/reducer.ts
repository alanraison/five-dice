import { PlayerJoinedAction, PlayerLeftAction } from '.';
import { Action } from './actions';
import { State } from './state';

export function reducer(state: State, action: Action): State {
  console.log(action);
  switch (action.event) {
    case 'player-joined': {
      return {
        ...state,
        allPlayers: [...(action as PlayerJoinedAction).allPlayers],
      };
    }
    case 'player-left': {
      return {
        ...state,
        allPlayers: (action as PlayerLeftAction).allPlayers.map((name) => ({
          name,
          character:
            state.allPlayers.find((player) => player.name === name)
              ?.character || 'unknown',
        })),
      };
    }
    default:
      return state;
  }
}
