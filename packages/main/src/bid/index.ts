import logger from '../logger';
import { getData, saveBid } from './dao';
import {
  allBidActions,
  Bid,
  BidderType,
  Dice,
  IncreaseBidAction,
} from './types';

type WebSocketBidEvent = {
  requestContext: {
    connectionId: string;
  };
  body: string;
};

export async function handler(event: WebSocketBidEvent) {
  logger.debug(event);
  const body = JSON.parse(event.body);
  const bid = allBidActions.parse(body);
  // if the game and player match, accept bid, otherwise silently drop (unless calza?)
  const gameData = await getData(bid.gameId, event.requestContext.connectionId);
  switch (bid.action) {
    case 'increase':
      // if the type is "bid", check that the bid is valid. set nextPlayer, send notification to all players
      handleIncrease(
        bid,
        gameData.bidderType,
        gameData.currentBid,
        bid.gameId,
        gameData.bidder,
        gameData.nextPlayer
      );
      //notifyNewBid(bid, gameData.nextPlayer);
      break;
    case 'dudo':
      // if the type is "dudo", check result and notifiy players; set dicecounts and nextPlayer
      handleDudo(
        bid.gameId,
        gameData.bidderType,
        gameData.currentBid,
        gameData.dice
      );
      break;
    case 'calza':
      // if the type is "calza"... leave for now
      handleCalza();
      break;
  }
  return {
    statusCode: 200,
  };
}

function handleIncrease(
  bid: IncreaseBidAction,
  bidderType: BidderType,
  currentBid: Bid,
  gameId: string,
  bidder: string,
  nextPlayer: string
) {
  if (bidderType !== BidderType.NEW_BIDDER) {
    return { error: 'out-of-turn' };
  }
  if (!checkBidIncrease(bid, currentBid)) {
    return { error: 'not-an-increase' };
  }
  saveBid(bid, gameId, bidder, nextPlayer);
}
function handleDudo(
  gameId: string,
  bidderType: BidderType,
  currentBid: Bid,
  dice: Dice
) {}
function handleCalza() {}

function checkBidIncrease(newBid: Bid, current: Bid) {
  if (current.v === 7 && newBid.v < 7) {
    return newBid.q >= current.q * 2 + 1;
  }
  if (current.v < 7 && newBid.v === 7) {
    return newBid.q >= current.q / 2;
  }
  return (
    newBid.q > current.q || (newBid.q === current.q && newBid.v > current.v)
  );
}
