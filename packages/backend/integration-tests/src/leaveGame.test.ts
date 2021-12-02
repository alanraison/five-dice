import request from 'superagent';
import { baseUrl } from './constants';
import { WebSocketConnection } from './websocket';

describe('Leave Game', () => {
  let gameId: string;
  beforeEach(async () => {
    const response = await request('post', `${baseUrl}/game`);
    gameId = response.body.gameId;
  });
  test('Closing the websocket connection should remove the player from the game', async () => {
    const conn = new WebSocketConnection({
      gameId,
      name: 'player',
    });
    try {
      await expect((await conn.connect()).connection).resolves.toBeDefined();
    } finally {
      conn.close();
    }
  });
  test('Player should be notified of players leaving the game', async () => {
    const client1 = new WebSocketConnection({
      gameId,
      name: 'test1',
    });

    const client2 = new WebSocketConnection({
      gameId,
      name: 'test2',
    });
    try {
      await client1.connect();
      expect(JSON.parse(await client1.nextMessage())).toMatchObject({
        event: 'player-joined',
      });

      await client2.connect();

      expect(JSON.parse(await client1.nextMessage())).toMatchObject({
        event: 'player-joined',
      });

      client2.close();

      expect(JSON.parse(await client1.nextMessage())).toMatchObject({
        event: 'player-left',
        player: 'test2',
        allPlayers: ['test1'],
      });
    } finally {
      client1.close();
      client2.close();
    }
  });
});
