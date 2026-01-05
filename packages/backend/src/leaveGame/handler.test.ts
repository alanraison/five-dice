import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handler } from './handler.js';
import { deleteConnection, removePlayerFromGame } from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

vi.mock('./dao.js');

describe('leaveGame handler', () => {
  const mockEventBridgeClient = mockClient(EventBridgeClient);
  beforeEach(() => {
    vi.resetAllMocks();
    mockEventBridgeClient.reset();
  });
  it("should delete the player's connection", async () => {
    vi.mocked(deleteConnection).mockResolvedValue({
      gameId: 'game1',
      player: 'player1',
    });
    await handler({
      requestContext: { connectionId: 'conn1' },
    });
    expect(vi.mocked(deleteConnection)).toHaveBeenCalledWith('conn1');
  });
  it('should remove the player from the game', async () => {
    vi.mocked(deleteConnection).mockResolvedValue({
      gameId: 'game2',
      player: 'player2',
    });
    await handler({
      requestContext: { connectionId: 'conn2' },
    });
    expect(vi.mocked(removePlayerFromGame)).toHaveBeenCalledWith(
      'game2',
      'player2',
    );
  });
  it('should create a player-left event', async () => {
    vi.mocked(deleteConnection).mockResolvedValue({
      gameId: 'game3',
      player: 'player3',
    });
    vi.mocked(removePlayerFromGame).mockResolvedValue(['player4']);
    const event = {
      requestContext: { connectionId: 'conn3' },
    };
    await handler(event);
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
