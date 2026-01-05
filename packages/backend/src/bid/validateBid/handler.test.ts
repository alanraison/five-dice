import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './index.js';

describe('validateBid handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('should validate a higher bid with same value', async () => {
    const event = {
      currentBid: { q: 3, v: 4 },
      newBid: { q: 4, v: 4 },
    };
    await expect(handler(event)).resolves.toEqual({ valid: true });
  });
  it('should invalidate a lower bid with same value', async () => {
    const event = {
      currentBid: { q: 4, v: 5 },
      newBid: { q: 3, v: 5 },
    };
    await expect(handler(event)).resolves.toEqual({
      valid: false,
      reason: 'bid too low, quantity must be > 4 and/or value must be > 5 or an ace',
    });
  });
  it('should validate an equal quantity bid with higher value', async () => {
    const event = {
      currentBid: { q: 2, v: 3 },
      newBid: { q: 2, v: 4 },
    };
    await expect(handler(event)).resolves.toEqual({ valid: true });
  });
  it('should invalidate a lower bid with lower value', async () => {
    const event = {
      currentBid: { q: 5, v: 6 },
      newBid: { q: 5, v: 5 },
    };
    await expect(handler(event)).resolves.toEqual({
      valid: false,
      reason: 'bid too low, quantity must be > 5 and/or value must be > 6 or an ace',
    });
  });
  it('should validate a bid of aces with sufficient quantity', async () => {
    const event = {
      currentBid: { q: 5, v: 6 },
      newBid: { q: 3, v: 7 },
    };
    await expect(handler(event)).resolves.toEqual({ valid: true });
  });
  it('should invalidate a bid of aces with insufficient quantity', async () => {
    const event = {
      currentBid: { q: 7, v: 6 },
      newBid: { q: 3, v: 7 },
    };
    await expect(handler(event)).resolves.toEqual({
      valid: false,
      reason: 'bid quantity too low, must be >= 4',
    });
  });
  it('should validate a normal bid over aces with sufficient quantity', async () => {
    const event = {
      currentBid: { q: 4, v: 7 },
      newBid: { q: 9, v: 6 },
    };
    await expect(handler(event)).resolves.toEqual({ valid: true });
  });
  it('should invalidate a normal bid over aces with insufficient quantity', async () => {
    const event = {
      currentBid: { q: 8, v: 7 },
      newBid: { q: 4, v: 5 },
    };
    await expect(handler(event)).resolves.toEqual({
      valid: false,
      reason: 'bid quantity too low, must be >= 17',
    });
  });
});
