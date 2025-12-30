import { combineReducers } from 'redux';
import { DISMISS_RESULT, GameAction } from './actions';
import { BID_INCREASED, CHALLENGE_RESULT, ROUND_STARTED } from '../events';

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

interface Result {
  counts: {
    [player: string]: Array<number>;
  };
  finalBid: {
    q: number;
    v: number;
  };
  challenger: string;
  bidder: string;
  result: string;
}

function result(state: Result | null = null, action: GameAction) {
  switch (action.type) {
    case CHALLENGE_RESULT:
      return {
        counts: action.counts,
        finalBid: action.bid,
        challenger: action.challenger,
        bidder: action.bidder,
        loser: action.loser,
      };
    case DISMISS_RESULT: {
      return null;
    }
    default:
      return state;
  }
}

export const round = combineReducers({
  dice,
  player,
  bid,
});
