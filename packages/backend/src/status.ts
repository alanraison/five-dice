export type Status =
  | 'Pending'
  | 'InProgress'
  | 'InitialBid'
  | 'Bidding'
  | 'Ended';

export const Status = {
  PENDING: 'Pending' as Status,
  IN_PROGRESS: 'InProgress' as Status,
  INITIAL_BID: 'InitialBid' as Status,
  BIDDING: 'Bidding' as Status,
  ENDED: 'Ended' as Status,
};
