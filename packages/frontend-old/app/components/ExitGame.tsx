import classNames from 'classnames';

export function ExitGame() {
  return (
    <div className="relative box-border">
      <div
        className={classNames(
          'absolute',
          'bg-black',
          'border-8',
          'border-black',
          'group',
          'right-0',
          'rounded-full',
          'top-0',
          'transition-all',
          'hover:rounded-l-none'
        )}
      >
        <div
          className={classNames(
            'absolute',
            'bg-black',
            'border-8',
            'border-black',
            'clip-full-x',
            'left-0',
            'p-2',
            'rounded-l-full',
            'text-white',
            '-top-2',
            'transition-all',
            'w-max',
            'group-hover:clip-none',
            'group-hover:-translate-x-full'
          )}
        >
          Exit Game
        </div>
        <div
          className={classNames(
            'bg-yellow-300',
            'h-10',
            'p-2',
            'rounded-full',
            'text-black'
          )}
        >
          <span className="material-icons">close</span>
        </div>
      </div>
    </div>
  );
}
