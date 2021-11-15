import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import eventQueueFactory from './eventqueue';

jest.mock('@aws-sdk/client-eventbridge');

describe('Queuer', () => {
  const mockEventBridgeClient = new EventBridgeClient({});
  const queue = eventQueueFactory(mockEventBridgeClient, 'event-bus');
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
