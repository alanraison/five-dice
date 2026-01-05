import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from './handler.js';
import { checkGameDetails, startGameRound } from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

vi.mock('./dao.js');
const mockEventBridgeClient = mockClient(EventBridgeClient);

describe('StartGame handler', () => {
  beforeEach(() => {
    mockEventBridgeClient.reset();
    vi.resetAllMocks();
  });
  it('should error if there is no gameId in the event body', async () => {
    await expect(() =>
      handler({
        requestContext: { connectionId: 'abcde' },
        body: JSON.stringify({}),
      }),
    ).rejects.toThrow();
  });
  it('should error if there are not enough players', async () => {
    vi.mocked(checkGameDetails).mockResolvedValue({
      player: 'player1',
      allPlayers: [{ name: 'player1', character: 'wizard' }],
    });
    vi.mocked(startGameRound).mockRejectedValue(new Error('Foo'));
    await expect(() =>
      handler({
        requestContext: { connectionId: 'abcde' },
        body: JSON.stringify({ gameId: 'aaaa' }),
      }),
    ).rejects.toThrow('Foo');
  });
  it('should create a game-started event', async () => {
    vi.mocked(checkGameDetails).mockResolvedValue({
      player: 'player1',
      allPlayers: [
        { name: 'player1', character: 'wizard' },
        { name: 'player2', character: 'knight' },
      ],
    });
    vi.mocked(startGameRound).mockResolvedValue();
    await handler({
      requestContext: { connectionId: 'conn1' },
      body: JSON.stringify({ gameId: 'game1' }),
    });
    expect(mockEventBridgeClient).toHaveReceivedCommandWith(PutEventsCommand, {
      Entries: [
        {
          EventBusName: process.env.EVENTBUS_NAME,
          DetailType: 'game-started',
          Detail: JSON.stringify({
            gameId: 'game1',
            startedBy: 'player1',
            players: [
              { name: 'player1', character: 'wizard' },
              { name: 'player2', character: 'knight' },
            ],
          }),
          Resources: ['game1'],
          Source: 'five-dice-wsapi',
        },
      ],
    });
    expect(vi.mocked(checkGameDetails)).toHaveBeenCalledWith('conn1', 'game1');
    expect(vi.mocked(startGameRound)).toHaveBeenCalledWith('game1', [
      { name: 'player1', character: 'wizard' },
      { name: 'player2', character: 'knight' },
    ]);
  })
});
