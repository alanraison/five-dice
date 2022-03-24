import { combineReducers } from 'redux';
import { GameAction } from './actions';
import { BID_INCREASED, ROUND_STARTED } from './events';

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
    case BID_INCREASED:
      return action.nextPlayer;
    default:
      return state;
  }
}

interface Bid {
  q: number;
  v: number;
  bidder: string;
}

function bid(state: Bid | null = null, action: GameAction) {
  switch (action.type) {
    case BID_INCREASED:
      const { q, v, bidder } = action;
      return { q, v, bidder };
    default:
      return state;
  }
}

export const round = combineReducers({
  dice,
  player,
  bid,
});
