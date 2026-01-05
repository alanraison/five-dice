import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handler } from './index.js';
import { getConnectionsForGame, saveDice } from './dao.js';
import { randomInt } from 'node:crypto';
import { mockClient } from 'aws-sdk-client-mock';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

vi.mock('./dao.js');
vi.mock('node:crypto', () => {
  return {
    randomInt: vi.fn(),
  };
});

describe('StartRound handler', () => {
  const mockApiGatewayClient = mockClient(ApiGatewayManagementApiClient);
  beforeEach(() => {
    vi.resetAllMocks();
    mockApiGatewayClient.reset();
  });
  it('should get all the connections for the game', async () => {
    await handler({
      id: 'event1',
      version: '1.0',
      account: '123456789012',
      time: '2020-04-02T07:20:50.52Z',
      region: 'us-east-1',
      resources: [],
      detail: {
        gameId: 'game1',
      },
      'detail-type': 'game-started',
      source: 'five-dice',
    });
    expect(vi.mocked(getConnectionsForGame)).toHaveBeenCalledWith('game1');
  });
  it('should roll dice for each connection', async () => {
    vi.mocked(getConnectionsForGame).mockResolvedValue([
      { CID: 'conn1', DiceCount: 6, Player: 'player1' },
      { CID: 'conn2', DiceCount: 6, Player: 'player2' },
    ]);
    vi.mocked(randomInt).mockImplementation(() => 4);
    await handler({
      id: 'event2',
      version: '1.0',
      account: '123456789012',
      time: '2020-04-02T07:20:50.52Z',
      region: 'us-east-1',
      resources: [],
      detail: {
        gameId: 'game2',
      },
      'detail-type': 'game-started',
      source: 'five-dice',
    });
    expect(vi.mocked(randomInt)).toHaveBeenCalledTimes(12);
  });
  it('should save the rolled dice', async () => {
    vi.mocked(getConnectionsForGame).mockResolvedValue([
      { CID: 'conn1', DiceCount: 2, Player: 'player1' },
      { CID: 'conn2', DiceCount: 2, Player: 'player2' },
    ]);
    vi.mocked(randomInt)
      .mockImplementationOnce(() => 1)
      .mockImplementationOnce(() => 2)
      .mockImplementationOnce(() => 3)
      .mockImplementationOnce(() => 4);
    await handler({
      id: 'event3',
      version: '1.0',
      account: '123456789012',
      time: '2020-04-02T07:20:50.52Z',
      region: 'us-east-1',
      resources: [],
      detail: {
        gameId: 'game3',
      },
      'detail-type': 'game-started',
      source: 'five-dice',
    });
    expect(vi.mocked(saveDice)).toHaveBeenCalledWith('game3', {
      byConnection: {
        conn1: [1, 2],
        conn2: [3, 4],
      },
      byPlayer: {
        player1: [1, 2],
        player2: [3, 4],
      },
    });
  });
  it('should send each player their dice, and who is the next player', async () => {
    vi.mocked(getConnectionsForGame).mockResolvedValue([
      { CID: 'conn1', DiceCount: 2, Player: 'player1' },
      { CID: 'conn2', DiceCount: 2, Player: 'player2' },
    ]);
    vi.mocked(randomInt)
      .mockImplementationOnce(() => 2)
      .mockImplementationOnce(() => 3)
      .mockImplementationOnce(() => 4)
      .mockImplementationOnce(() => 5);
    vi.mocked(saveDice).mockResolvedValue('player2');
    await handler({
      id: 'event4',
      version: '1.0',
      account: '123456789012',
      time: '2020-04-02T07:20:50.52Z',
      region: 'us-east-1',
      resources: [],
      detail: {
        gameId: 'game4',
      },
      'detail-type': 'game-started',
      source: 'five-dice',
    });
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn1',
      },
    );
    expect(mockApiGatewayClient).toHaveReceivedCommandWith(
      PostToConnectionCommand,
      {
        ConnectionId: 'conn2',
      },
    );
    const calls = mockApiGatewayClient.commandCalls(PostToConnectionCommand);
    const data1 = {
      ConnectionId: calls[0].args[0].input.ConnectionId,
      ...JSON.parse(calls[0].args[0].input.Data?.toString() || '{}'),
    };
    const data2 = {
      ConnectionId: calls[1].args[0].input.ConnectionId,
      ...JSON.parse(calls[1].args[0].input.Data?.toString() || '{}'),
    };
    expect([data1, data2]).toContainEqual({
      ConnectionId: 'conn1',
      event: 'round-started',
      dice: [2, 3],
      firstPlayer: 'player2',
    });
    expect([data1, data2]).toContainEqual({
      ConnectionId: 'conn2',
      event: 'round-started',
      dice: [4, 5],
      firstPlayer: 'player2',
    });
  });
});
