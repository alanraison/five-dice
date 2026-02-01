import { beforeEach, describe, expect, it } from 'vitest';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import { queuerFactory } from './event.js';

describe('Queuer', () => {
  const eventBridgeClient = new EventBridgeClient();
  const mockEventBridgeClient = mockClient(eventBridgeClient);
  const queue = queuerFactory(eventBridgeClient, 'test-event-bus');
  beforeEach(() => {
    mockEventBridgeClient.reset();
  });
  it('should queue an event on the queue', async () => {
    await queue({
      gameId: 'aaa',
      newPlayer: { name: 'new', character: '' },
      allPlayers: [{ name: 'new', character: '' }],
    });
    expect(mockEventBridgeClient).toHaveReceivedCommand(PutEventsCommand);
  });
  it('should throw an error if there is an error putting events', async () => {
    mockEventBridgeClient.on(PutEventsCommand).rejects(new Error('Some Error'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(() => queue({} as any)).rejects.toThrow('Some Error');
  });
});
