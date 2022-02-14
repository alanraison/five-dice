import { useState } from 'react';
import { Form, useActionData, useLoaderData, useTransition } from 'remix';
import { AppData, DataFunctionArgs } from '@remix-run/server-runtime';
import { redirect } from 'remix';
import classNames from 'classnames';
import { gameExists } from '~/api/game';
import { createGame } from '~/api/create';

export async function action({
  request,
}: DataFunctionArgs): Promise<Response | AppData> {
  if (request.method !== 'POST') {
    throw new Response('Method not allowed', {
      status: 405,
      statusText: 'Method not allowed',
    });
  }
  const formData = await request.formData();
  switch (formData.get('type')) {
    case 'new':
      try {
        const gameId = await createGame();
        return redirect(`/${encodeURIComponent(gameId)}/join`);
      } catch (err) {
        return err;
      }
    case 'join':
      const gameId = formData.get('gameId')?.toString();
      if (!(await gameExists(gameId))) {
        return {
          gameId: 'Game not found',
        };
      }
      return redirect(`/${encodeURIComponent(gameId || '')}`);
    default:
      return {};
  }
}

export default function Start() {
  return (
    <main>
      <h1 className="text-6xl text-white">Five Dice</h1>
      <div className="bg-white border-8 border-black rounded-xl w-full p-4 my-2">
        Welcome to Five Dice, the online Perudo game!
      </div>
      <StartGamePanel />
      <JoinGamePanel />
    </main>
  );
}

function StartGamePanel() {
  const { state: transitionState } = useTransition();
  return (
    <Form method="post">
      <input type="hidden" name="type" value="new" />
      <button
        className={classNames(
          'bg-yellow-300',
          'border-8',
          'border-black',
          'rounded-xl',
          'w-full',
          'p-4',
          'my-2',
          'text-4xl',
          'uppercase',
          'disabled:bg-yellow-500',
          'hover:border-green-700',
          'hover:text-green-700'
        )}
        disabled={transitionState === 'submitting'}
      >
        Start Game
      </button>
    </Form>
  );
}

function JoinGamePanel() {
  const [gameCode, setGameCode] = useState<string>('');
  const errors = useActionData();
  return (
    <div
      className={classNames(
        'bg-yellow-300',
        'border-8',
        'border-black',
        'rounded-xl',
        'p-4',
        'my-2',
        {
          'border-red-500': errors?.gameId,
          'hover:border-green-700': !errors?.gameId,
        }
      )}
    >
      <Form method="post">
        <p className="p-2 text-center">Got a Game Code?</p>
        <fieldset className="mx-auto text-center">
          <input type="hidden" name="type" value="join" />
          <input
            id="gameId"
            name="gameId"
            placeholder="Game Code"
            onChange={(e) => setGameCode(e.target.value)}
            className={classNames('p-2', { 'bg-red-300': errors?.gameId })}
          />
          {errors?.gameId ? (
            <div className="text-red-500">{errors.gameId}</div>
          ) : null}
        </fieldset>
        <button
          type="submit"
          className={classNames(
            'text-4xl',
            'uppercase',
            'w-full',
            'hover:text-green-700',
            'disabled:text-gray-500'
          )}
          disabled={!gameCode}
        >
          Join Game
        </button>
      </Form>
    </div>
  );
}
