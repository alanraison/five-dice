import request from 'superagent';
import { baseUrl } from './constants';
import { WebSocketConnection } from './websocket';

describe('Join Game', () => {
  test('not supplying a game id should fail', async () => {
    await expect(async () =>
      (
        await new WebSocketConnection({
          name: 'player1',
        }).connect()
      ).close()
    ).rejects.toThrowError('Bad Request');
  });
  test('joining a non existent game should fail', async () => {
    await expect(async () =>
      (
        await new WebSocketConnection({
          gameId: '======',
          name: 'player1',
        }).connect()
      ).close()
    ).rejects.toThrowError('Bad Request');
  });
  describe('with a game id', () => {
    let gameId: string;
    beforeEach(async () => {
      gameId = (await request('post', `${baseUrl}/game`)).body.gameId;
    });
    test('not supplying a player name should fail', async () => {
      await expect(async () => {
        (
          await new WebSocketConnection({
            gameId,
          }).connect()
        ).close();
      }).rejects.toThrowError('Bad Request');
    });
    test('supplying the same player twice should fail', async () => {
      const conn = await new WebSocketConnection({
        gameId,
        name: 'player',
      }).connect();

      try {
        await expect(
          async () =>
            await (
              await new WebSocketConnection({
                gameId,
                name: 'player',
              }).connect()
            ).close()
        ).rejects.toThrowError('Bad Request');
      } finally {
        conn.close();
      }
    });
    test('no more than 6 players can join a game', async () => {
      const connections = Array<Promise<WebSocketConnection>>(6);
      try {
        for (let i = 0; i < 6; i++) {
          connections[i] = new WebSocketConnection({
            gameId,
            name: `player${i}`,
          }).connect();
        }
        await Promise.all(connections);

        await expect(
          async () =>
            await (
              await new WebSocketConnection({
                gameId,
                name: 'player7',
              }).connect()
            ).close()
        ).rejects.toThrowError('Bad Request');
      } finally {
        Promise.all(connections.map(async (c) => (await c).close()));
      }
    });
    test('Player should recieve notification that they have joined', async () => {
      const connection = await new WebSocketConnection({
        gameId,
        name: 'test1',
      }).connect();
      try {
        expect(JSON.parse(await connection.nextMessage())).toMatchObject({
          event: 'player-joined',
          newPlayer: 'test1',
          allPlayers: expect.arrayContaining(['test1']),
        });
      } finally {
        connection.close();
      }
    });
    test('Player should receive a notification when another player joins', async () => {
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
          newPlayer: 'test1',
          allPlayers: expect.arrayContaining(['test1']),
        });

        await client2.connect();

        expect(JSON.parse(await client1.nextMessage())).toMatchObject({
          event: 'player-joined',
          newPlayer: 'test2',
          allPlayers: ['test1', 'test2'],
        });
      } finally {
        client1.close();
        client2.close();
      }
    });
  });
});
