import { z } from 'zod';
import logger from '../../logger';

const validateEvent = z.object({
  q: z.number(),
  v: z.number(),
  data: z.object({
    isCurrentBidder: z.boolean(),
    currentBid: z.object({
      q: z.number(),
      v: z.number(),
    }),
  }),
});

export async function handler(event: z.infer<typeof validateEvent>) {
  const validate = validateEvent.parse(event);
  const newBid = {
    q: validate.q,
    v: validate.v,
  };
  const current = validate.data.currentBid;
  const isCurrentBidder = validate.data.isCurrentBidder;
  logger.info({ newBid, current, isCurrentBidder }, 'validating bid');

  if (!isCurrentBidder) {
    logger.warn({ isCurrentBidder }, 'bid received from wrong player');
    return false;
  }
  if (newBid.v < 2 || newBid.v > 7) {
    throw new Error(`Values out of range: ${newBid.v}`);
  }
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
