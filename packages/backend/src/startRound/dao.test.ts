import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getConnectionsForGame, saveDice } from './dao.js';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { Status } from '../status.js';

describe('StartRoundDAO', () => {
  const mockDynamoDBClient = mockClient(DynamoDBClient);
  beforeEach(() => {
    mockDynamoDBClient.reset();
    vi.clearAllMocks();
  });
  describe('getConnectionsForGame', () => {
    it('should fetch the number of dice for each connection in the game with more than 0 dice remaining', async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: [
          {
            DiceCount: { N: '3' },
            CID: { S: 'conn1' },
            Player: { S: 'player1' },
          },
          {
            DiceCount: { N: '1' },
            CID: { S: 'conn2' },
            Player: { S: 'player2' },
          },
        ],
      });
      await getConnectionsForGame('game1');
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(QueryCommand, {
        ExpressionAttributeNames: expect.objectContaining({
          '#cid': 'CID',
          '#diceCount': 'DiceCount',
          '#player': 'Player',
        }),
        ProjectionExpression: '#cid,#diceCount,#player',
        FilterExpression: '#diceCount > :zero',
      });
    });
    it("should error if a Player isn't present in the database", async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: [
          {
            DiceCount: { N: '2' },
            CID: { S: 'conn1' },
          },
        ],
      });
      await expect(() => getConnectionsForGame('game2')).rejects.toThrow(
        'Invalid Player data: connection id conn1, Player Name undefined',
      );
    });
    it("should error if a ConnectionId isn't present in the database", async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: [
          {
            DiceCount: { N: '2' },
            Player: { S: 'player1' },
          },
        ],
      });
      await expect(() => getConnectionsForGame('game3')).rejects.toThrow(
        'Invalid Player data: connection id undefined, Player Name player1',
      );
    });
    it('should return the players, their connection ids and dice counts', async () => {
      mockDynamoDBClient.on(QueryCommand).resolves({
        Items: [
          {
            DiceCount: { N: '5' },
            CID: { S: 'conn1' },
            Player: { S: 'player1' },
          },
          {
            DiceCount: { N: '2' },
            CID: { S: 'conn2' },
            Player: { S: 'player2' },
          },
        ],
      });
      const result = await getConnectionsForGame('game4');
      expect(result).toEqual([
        { CID: 'conn1', DiceCount: 5, Player: 'player1' },
        { CID: 'conn2', DiceCount: 2, Player: 'player2' },
      ]);
    });
  });
  describe('saveDice', () => {
    it("should save all the players' dice to the database", async () => {
      mockDynamoDBClient.on(UpdateItemCommand).resolves({
        Attributes: {
          NextPlayer: { S: 'player1' },
        },
      });
      await saveDice('game1', {
        byConnection: {
          conn1: [3, 4, 5],
          conn2: [1, 2],
        },
        byPlayer: {
          player1: [3, 4, 5],
          player2: [1, 2],
        },
      });
      expect(mockDynamoDBClient).toHaveReceivedCommandWith(UpdateItemCommand, {
        Key: {
          PK: { S: 'GAME#game1' },
        },
        ExpressionAttributeValues: {
          ':dice': {
            M: {
              player1: { L: [{ N: '3' }, { N: '4' }, { N: '5' }] },
              player2: { L: [{ N: '1' }, { N: '2' }] },
            },
          },
          ':bid': {
            M: { q: { N: '0' }, v: { N: '7' } },
          },
          ':initialBid': { S: Status.INITIAL_BID },
        },
      });
    });
    it('should return the next player to start', async () => {
      mockDynamoDBClient.on(UpdateItemCommand).resolves({
        Attributes: {
          NextPlayer: { S: 'player2' },
        },
      });
      const nextPlayer = await saveDice('game2', {
        byConnection: {
          conn1: [2, 3],
          conn2: [4, 5],
        },
        byPlayer: {
          player1: [2, 3],
          player2: [4, 5],
        },
      });
      expect(nextPlayer).toBe('player2');
    });
    it('should throw an error if no next player is returned', async () => {
      mockDynamoDBClient.on(UpdateItemCommand).resolves({
        Attributes: {},
      });
      await expect(
        saveDice('game3', {
          byConnection: {
            conn1: [1],
          },
          byPlayer: {
            player1: [1],
          },
        }),
      ).rejects.toThrow('NextPlayer not found');
    });
  });
});
