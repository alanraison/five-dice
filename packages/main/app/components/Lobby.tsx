import classNames from 'classnames';
import { Link, useParams } from 'remix';
import { exit, startGame } from '~/reducers/commands';
import { useAppDispatch, useAppSelector } from '~/reducers/hooks';

const playerUnknown = {
  name: 'Unknown',
  character: '',
};

export function Lobby() {
  const { gameId } = useParams();
  const players = useAppSelector((state) => state.players);
  const player = useAppSelector((state) => state.player) || playerUnknown;
  const dispatch = useAppDispatch();
  if (!gameId) {
    throw new Error('Game ID not found');
  }
  console.log(players);
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
          <li className={classNames('flex', 'items-center')}>
            <span className="flex-1">{player.name} (You)</span>
            <svg className="w-20 h-20 ml-4 inline">
              <use
                xlinkHref={`/_static/images/characters.svg#${player.character}`}
              />
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
          onClick={() => dispatch(startGame())}
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
          onClick={() => dispatch(exit())}
        >
          Leave Game
        </Link>
      </div>
    </>
  );
}
