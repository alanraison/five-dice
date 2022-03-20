interface DieProps {
  value: number;
}

export function Die({ value }: DieProps) {
  return <li>{value === 7 ? 'Ace' : value}</li>;
}
