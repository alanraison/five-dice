import { z } from 'zod';

export enum BidderType {
  OLD_BIDDER,
  NEW_BIDDER,
  OTHER,
}

const bid = z.object({
  q: z.number(),
  v: z.number(),
});

export type Bid = z.infer<typeof bid>;

const bidAction = z.object({
  gameId: z.string(),
});

export const increaseBidAction = bidAction
  .extend({
    action: z.literal('increase'),
  })
  .merge(bid);

export type IncreaseBidAction = z.infer<typeof increaseBidAction>;

export const dudoChallengeAction = bidAction.extend({
  action: z.literal('dudo'),
});

export type DudoChallengeAction = z.infer<typeof dudoChallengeAction>;

export const calzaChallengeAction = bidAction.extend({
  action: z.literal('calza'),
});

export type CalzaChallengeAction = z.infer<typeof calzaChallengeAction>;

// export const allBidActions = z.discriminatedUnion('action', [
//   increaseBidAction,
//   dudoChallengeAction,
//   calzaChallengeAction,
// ]);

export type Dice = {
  [player: string]: Array<number>;
};
