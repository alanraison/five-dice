import { z } from 'zod';

export const player = z.object({
  name: z.string(),
  character: z.string(),
});

export type Player = z.infer<typeof player>;

export const bid = z.object({
  q: z.number(),
  v: z.number(),
});

export type Bid = z.infer<typeof bid>;
