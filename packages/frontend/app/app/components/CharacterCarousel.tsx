export interface CharacterCarouselProps {
  character: string;
  onChange: (image: string) => void;
  className?: string;
}

export const allCharacters = [
  'alien1',
  'alien2',
  'alien3',
  'alien4',
  'alien5',
  'alien6',
  'alien7',
  'alien8',
  'alien9',
  'alien10',
  'alien11',
  'alien12',
  'alien13',
  'alien14',
  'alien15',
  'alien16',
];

export default function CharacterCarousel({
  character,
  onChange,
  className,
}: CharacterCarouselProps) {
  const index = allCharacters.indexOf(character);
  if (index === -1) {
    throw new Error('invalid character id');
  }
  return (
    <div className={className}>
      <button
        className="rounded-full bg-white h-12 w-12 hover:shadow-md opacity-50 hover:opacity-100 -mr-4 z-40 hover:z-40 my-auto inline"
        onClick={() => {
          const i = (index - 1 + allCharacters.length) % allCharacters.length;
          onChange(allCharacters[i]);
        }}
      >
        &lt;
      </button>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-28 z-20 inline"
        viewBox="0 0 150 140"
      >
        {allCharacters.map((c, i) => {
          const length = allCharacters.length;
          return (
            <use
              className="transition-transform duration-1000"
              key={c}
              transform={`translate(${
                (((length / 2 + length + i - index) % length) - length / 2) *
                150
              } ${Math.abs(i - index) % (length - 1) > 1 ? 140 : 0})`}
              xlinkHref={`/images/characters.svg#${c}`}
            />
          );
        })}
      </svg>
      <button
        className="rounded-full bg-white h-12 w-12 hover:shadow-md opacity-50 hover:opacity-100 -ml-4 z-40 inline"
        onClick={() => {
          const i = (index + 1) % allCharacters.length;
          onChange(allCharacters[i]);
        }}
      >
        &gt;
      </button>
    </div>
  );
}
