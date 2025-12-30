import classNames from 'classnames';
import { useAppSelector } from '~/reducers/hooks';

export function Players() {
  const players = useAppSelector((state) => state.players);
  const nextPlayer = useAppSelector((state) => state.round.player);
  const bid = useAppSelector((state) => state.round.bid);
  return (
    <>
      {!bid ? `Waiting for first bid from ${nextPlayer}` : null}
      <ol>
        {players.map((player, i) => (
          <li
            key={i}
            className={classNames({ 'list-disc': player.name === nextPlayer })}
          >
            {player.name}
            {player.name === bid?.bidder ? (
              <div>
                q: {bid.q} v: {bid.v}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
