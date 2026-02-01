import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import { afterEach, expect, it, test, vi } from 'vitest';
import { queuerFactory } from './event.js';

test.todo('Queuer', () => {
  const client = new EventBridgeClient();
  const mockEventBridgeClient = mockClient(client);
  const eventBusName = 'test-event-bus';

  const queuer = queuerFactory(client, eventBusName);

  afterEach(() => {
    mockEventBridgeClient.reset();
  });

  it('should create a player-left event', async () => {
    await queuer('player3', ['player4'], 'game3');
    expect(mockEventBridgeClient).toHaveReceivedCommandWith(PutEventsCommand, {
      Entries: [
        expect.objectContaining({
          DetailType: 'player-left',
        }),
      ],
    });
    const calls = mockEventBridgeClient.commandCalls(PutEventsCommand);
    const detail = JSON.parse(calls[0].args[0].input.Entries?.[0].Detail ?? '');
    expect(detail).toEqual({
      player: 'player3',
      allPlayers: ['player4'],
      gameId: 'game3',
    });
  });
});
