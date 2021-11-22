import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import pino from 'pino';
import queue from './event';

jest.mock('@aws-sdk/client-eventbridge');
jest.mock('../logger', () => pino({ enabled: false }));

describe('Queuer', () => {
  const mockEventBridgeClient = new EventBridgeClient({});
  it('should queue an event on the queue', () => {
    queue({ gameId: 'aaa', newPlayer: 'new', allPlayers: ['new'] });
    expect(mockEventBridgeClient.send).toHaveBeenCalled();
  });
  it('should throw an error if there is an error putting events', async () => {
    (mockEventBridgeClient.send as jest.Mock).mockRejectedValue(
      new Error('Some Error')
    );
    await expect(queue({} as any)).rejects.toThrowError('Some Error');
  });
});
