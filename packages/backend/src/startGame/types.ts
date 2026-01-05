import { z } from 'zod';

export const StartGameEventBody = z.object({
  gameId: z.string().min(1),
});

export type StartGameEventBody = z.infer<typeof StartGameEventBody>;
