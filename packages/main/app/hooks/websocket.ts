import { Dispatch, useEffect, useReducer, useRef } from 'react';
import { string, z } from 'zod';
import { Action, PendingState, reducer, State } from '~/reducers';
import { useGameReducer } from '~/reducers/context';
import { Player } from '~/types';

const WebsocketEvent = z.object({
  event: z.string(),
});

const PlayerJoinedEvent = WebsocketEvent.extend({
  event: z.literal('player-joined'),
  newPlayer: z.object({
    name: z.string(),
    character: z.string(),
  }),
  allPlayers: z.array(
    z.object({
      name: z.string(),
      character: z.string(),
    })
  ),
});

const PlayerLeftEvent = WebsocketEvent.extend({
  event: z.literal('player-left'),
  player: z.string(),
  allPlayers: z.array(z.string()),
});

export function useWebSocket(
  wsUrl: string,
  gameId: string,
  player: Player
): [State, Dispatch<Action>] {
  const websocket = useRef<WebSocket>();
  const [state, dispatch] = useReducer(reducer, {
    state: 'pending',
    allPlayers: [],
  });
  useEffect(() => {
    if (!websocket.current) {
      const url = new URL(wsUrl);
      url.searchParams.set('gameId', gameId || '');
      url.searchParams.set('name', player.name);
      url.searchParams.set('character', player.character);

      websocket.current = websocket.current || new WebSocket(url);
      websocket.current.onmessage = (messageEvent: MessageEvent) => {
        console.log(`received ws message: ${messageEvent.data}`);
        const json = JSON.parse(messageEvent.data);
        const parse = WebsocketEvent.safeParse(json);
        if (parse.success) {
          switch (parse.data.event) {
            case 'player-joined':
              dispatch(PlayerJoinedEvent.parse(json));
              break;
            case 'player-left':
              dispatch(PlayerLeftEvent.parse(json));
              break;
          }
        } else {
          console.log(parse);
        }
      };
    }
    return () => {
      websocket.current?.close();
      websocket.current = undefined;
    };
  }, []);
  return [state, dispatch];
}
