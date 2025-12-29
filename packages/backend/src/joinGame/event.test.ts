import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import pino from 'pino';
import queue from './event.js';

jest.mock('@aws-sdk/client-eventbridge');
jest.mock('../logger', () => pino({ enabled: false }));

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
    (mockEventBridgeClient.send as jest.Mock).mockRejectedValue(
      new Error('Some Error'),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => queue({} as any)).toThrow('Some Error');
  });
});
