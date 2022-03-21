import { useAppSelector } from '~/reducers/hooks';

export function Players() {
  const players = useAppSelector((state) => state.players);
  const bid = useAppSelector((state) => state.round.bid);
  return (
    <>
      {!bid ? 'Waiting for first bid' : null}
      <ol>
        {players.map((player, i) => (
          <li key={i}>
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
