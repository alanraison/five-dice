import { z } from 'zod';

export const JoinGameRequest = z.object({
  gameId: z.string().min(1),
  name: z.string().min(1),
  character: z.string().min(1),
});
