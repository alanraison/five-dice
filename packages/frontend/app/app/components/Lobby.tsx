import classNames from 'classnames';
import { useEffect } from 'react';
import { Link, useParams } from 'remix';
import { Player } from '~/types';

interface LobbyProps {
  player: Player;
  players: Array<Player>;
}

export default function Lobby({ players, player }: LobbyProps) {
  const { gameId } = useParams();
  const otherPlayers = players.filter((p) => p.name !== player.name);
  return (
    <>
      <div className="text-3xl uppercase">Waiting for Players</div>
      <div className="p-2">
        Game Code:{' '}
        <input className="bg-green-300 p-2 w-20" value={gameId} readOnly />
      </div>
      <div className="bg-white rounded-3xl border-black border-8 p-8">
        <ul>
          <li className={classNames({ '': false }, 'flex', 'items-center')}>
            <span className="flex-1">{player.name} (You)</span>
            <svg className="w-20 h-20 ml-4 inline">
              <use xlinkHref={`/images/characters.svg#${player.character}`} />
            </svg>
          </li>
          {otherPlayers?.map((p) => (
            <li key={p.name} className="flex items-center">
              <svg className="w-20 h-20 mr-4 inline">
                <use xlinkHref={`/images/characters.svg#${p.character}`} />
              </svg>
              <span className="flex-1">{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full">
        <button
          className={classNames(
            'm-4',
            'p-2',
            'mx-auto',
            'w-full',
            'text-xl',
            'block',
            'bg-green-300',
            'border-8',
            'border-black',
            'rounded-xl'
          )}
        >
          Start Game
        </button>
        <Link
          to="/"
          className={classNames(
            'm-4',
            'p-2',
            'mx-auto',
            'text-xl',
            'block',
            'text-center',
            'border-8',
            'border-black',
            'rounded-xl'
          )}
        >
          Leave Game
        </Link>
      </div>
    </>
  );
}
