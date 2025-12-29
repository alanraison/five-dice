import { z } from 'zod';
import logger from '../../logger';

const validateEvent = z.object({
  newBid: z.object({
    q: z.number(),
    v: z.number(),
  }),
  currentBid: z.object({
    q: z.number(),
    v: z.number(),
  }),
});

export async function handler(event: z.infer<typeof validateEvent>) {
  const validate = validateEvent.parse(event);
  const { currentBid, newBid } = validate;
  logger.info({ newBid, currentBid }, 'validating bid');

  if (newBid.v < 2 || newBid.v > 7) {
    return {
      valid: false,
      reason: `bid value out of range: ${newBid.v}`,
    };
  }
  if (currentBid.v === 7 && newBid.v < 7) {
    const valid = newBid.q >= currentBid.q * 2 + 1;
    const reason = `bid quantity too low, must be >= ${currentBid.q * 2 + 1}`;
    return {
      valid,
      ...(!valid ? { reason } : undefined),
    };
  }
  if (currentBid.v < 7 && newBid.v === 7) {
    const valid = newBid.q >= currentBid.q / 2;
    const reason = `bid quantity too low, must be >= ${Math.ceil(
      currentBid.q / 2
    )}`;
    return {
      valid,
      ...(!valid ? { reason } : undefined),
    };
  }
  const valid =
    newBid.q > currentBid.q ||
    (newBid.q === currentBid.q && newBid.v > currentBid.v);
  const reason = `bid too low, quantity must be > ${currentBid.q} and/or value must be > ${currentBid.v} or an ace`;
  return {
    valid,
    ...(!valid ? { reason } : undefined),
  };
}
