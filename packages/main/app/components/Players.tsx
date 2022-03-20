import { useAppSelector } from '~/reducers/hooks';

export function Players() {
  const players = useAppSelector((state) => state.players);
  return (
    <ol>
      {players.map((player, i) => (
        <li key={i}>{player.name}</li>
      ))}
    </ol>
  );
}
