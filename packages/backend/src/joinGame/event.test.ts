import { describe, expect, it, vi } from 'vitest';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import queue from './event.js';

vi.mock('@aws-sdk/client-eventbridge', { spy: true });
vi.mock('../logger.js');

describe('Queuer', () => {
  const mockEventBridgeClient = new EventBridgeClient({});
  it('should queue an event on the queue', () => {
    queue({
      gameId: 'aaa',
      newPlayer: { name: 'new', character: '' },
      allPlayers: [{ name: 'new', character: '' }],
    });
    expect(mockEventBridgeClient.send).toHaveBeenCalled();
  });
  it('should throw an error if there is an error putting events', async () => {
    vi.mocked(mockEventBridgeClient.send).mockRejectedValue(
      new Error('Some Error'),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(() => queue({} as any)).rejects.toThrowError('Some Error');
  });
});
