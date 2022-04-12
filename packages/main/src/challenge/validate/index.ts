import { z } from 'zod';

const challengeEvent = z.object({
  bid: z.object({
    q: z.number(),
    v: z.number(),
  }),
  dice: z.record(z.array(z.number())),
});

export async function handler(event: any) {
  const parsed = challengeEvent.parse(event);
  const counts: { [player: string]: Array<number> } = Object.entries(
    parsed.dice
  )?.reduce(
    (acc, [player, dice]: [string, Array<number>]) => ({
      ...acc,
      [player]: dice.filter((d) => d === parsed.bid.v || d === 7).sort(),
    }),
    {}
  );
  const total = Object.values(counts).reduce(
    (acc, dice) => acc + dice.length,
    0
  );
  return {
    counts,
    success: parsed.bid.q > total,
  };
}
