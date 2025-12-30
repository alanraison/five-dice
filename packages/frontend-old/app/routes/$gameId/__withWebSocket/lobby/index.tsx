import {
  ActionFunction,
  json,
  LoaderFunction,
} from '@remix-run/server-runtime';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import {
  GAME_STARTED,
  parseToEvent,
  PLAYER_JOINED,
  PLAYER_LEFT,
} from '~/events';
import { exit, startGame } from '~/reducers/commands';
import { useAppDispatch } from '~/reducers/hooks';
import { commitSession, getSession } from '~/session';
import { Player } from '~/types';
import { useWebSocket } from '~/websocket';

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
    },
  ];
}

export const action: ActionFunction = function action() {
  console.log('lobby action');
};

export const loader: LoaderFunction = async function loader({ request }) {
  const session = await getSession(request.headers.get('Cookie'));
  const name = session.get('name');
  const character = session.get('character');
  return json(
    {
      name,
      character,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
};

const playerUnknown = {
  name: 'Unknown',
  character: '',
};

export default function Lobby() {
  const { gameId } = useParams();
  const { name, character } = useLoaderData<Player>();
  const [players, setPlayers] = useState<Array<Player>>([]);
  const {
    sendMessage,
    addMessageListener,
    close: closeWebSocket,
  } = useWebSocket();
  // const players = useAppSelector((state) => state.players);
  const navigate = useNavigate();

  useEffect(() => {
    addMessageListener((ev: MessageEvent<string>) => {
      const event = parseToEvent(JSON.parse(ev.data));
      switch (event?.event) {
        case PLAYER_JOINED:
          setPlayers(event.allPlayers);
          break;
        case PLAYER_LEFT:
          setPlayers(players.filter((p) => p.name !== event.player));
          break;
        case GAME_STARTED:
          navigate('../round');
          break;
        default:
          console.log('unexpected event', ev.data);
      }
    });
  });

  // const player = useAppSelector((state) => state.player) || playerUnknown;
  // const dispatch = useAppDispatch();
  if (!gameId) {
    throw new Error('Game ID not found');
  }
  if (!(name && character)) {
    navigate('../');
  }
  console.debug(players);
  const otherPlayers = players.filter((p) => p.name !== name);
  return (
    <>
      <div className="text-3xl uppercase">Waiting for Players</div>
      <div className="p-2">
        Game Code:
        <input className="bg-green-300 p-2 w-20" value={gameId} readOnly />
        <a href="#">
          <span className="material-icons">content_copy</span>
        </a>
      </div>
      <div className="bg-white rounded-3xl border-black border-8 p-8">
        <ul>
          <li className="flex items-center">
            <span className="flex-1">{name} (You)</span>
            <svg className="w-20 h-20 ml-4 inline">
              <use xlinkHref={`/_static/images/characters.svg#${character}`} />
            </svg>
          </li>
          {otherPlayers?.map((p) => (
            <li key={p.name} className="flex items-center">
              <svg className="w-20 h-20 mr-4 inline">
                <use
                  xlinkHref={`/_static/images/characters.svg#${p.character}`}
                />
              </svg>
              <span className="flex-1">{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full">
        <Link
          className={classNames(
            'bg-green-300',
            'block',
            'border-8',
            'border-black',
            'm-4',
            'mx-auto',
            'p-2',
            'rounded-xl',
            'text-xl',
            'w-full'
          )}
          to="../round"
          onClick={() => sendMessage(startGame())}
        >
          Start Game
        </Link>
        <Link
          to="/"
          className={classNames(
            'block',
            'border-8',
            'border-black',
            'm-4',
            'mx-auto',
            'p-2',
            'rounded-xl',
            'text-center',
            'text-xl'
          )}
          onClick={() => closeWebSocket()}
        >
          Leave Game
        </Link>
      </div>
    </>
  );
}
