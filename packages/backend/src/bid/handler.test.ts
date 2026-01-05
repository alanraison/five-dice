import { describe, expect, it } from 'vitest';
import { handler } from './index.js';

describe('bid handler', () => {
  it('should allow a valid bid increase', async() => {
    await expect(handler({
      requestContext: { connectionId: 'conn1' },
      body: JSON.stringify({ action: 'increase', gameId: 'game1', q: 4, v: 5 }),
    })).resolves.toEqual({ statusCode: 200 });
  })
});
