import { combineReducers } from 'redux';
import { Bid } from '~/types';
import { GameAction } from './actions';
import { ROUND_STARTED } from './events';

function dice(state: Array<number> = [], action: GameAction) {
  switch (action.type) {
    case ROUND_STARTED:
      return action.dice;
    default:
      return state;
  }
}

function player(state: string = '', action: GameAction) {
  switch (action.type) {
    case ROUND_STARTED:
      return action.firstPlayer;
    default:
      return state;
  }
}

function bid(state: Bid | null = null, action: GameAction) {
  switch (action.type) {
    default:
      return state;
  }
}

export const round = combineReducers({
  dice,
  player,
  bid,
});
