import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handlerFactory } from './handler.js';
import { leaveGameDAOFactory } from './dao.js';
import { queuerFactory } from './event.js';
import { mockClient } from 'aws-sdk-client-mock';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

vi.mock('./dao.js');
vi.mock('./event.js');

describe('leaveGame handler', () => {
  const deleteConnection = vi.fn();
  const removePlayerFromGame = vi.fn();
  const notify = vi.fn();
  const handler = handlerFactory(
    {
      deleteConnection,
      removePlayerFromGame,
    },
    notify,
  );

  beforeEach(() => {
    vi.resetAllMocks();
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
  it('should notify other players that the player has left', async () => {
    vi.mocked(deleteConnection).mockResolvedValue({
      gameId: 'game3',
      player: 'player3',
    });
    vi.mocked(removePlayerFromGame).mockResolvedValue(['player4']);
    await handler({
      requestContext: { connectionId: 'conn3' },
    });
    expect(vi.mocked(notify)).toHaveBeenCalledWith('player3', ['player4'], 'game3');
  });
});
