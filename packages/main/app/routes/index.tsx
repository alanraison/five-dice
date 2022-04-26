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
  let gameId: string;
  switch (formData.get('type')) {
    case 'new':
      try {
        gameId = await createGame();
        break;
      } catch (err) {
        return err;
      }
    case 'join':
      gameId = formData.get('gameId')?.toString() || '';
      if (!(await gameExists(gameId))) {
        return {
          gameId: 'Game not found',
        };
      }
      break;
    default:
      return {};
  }
  return redirect(`/${encodeURIComponent(gameId)}`);
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
        disabled={
          transitionState === 'submitting' || transitionState === 'loading'
        }
      >
        Start Game
      </button>
    </Form>
  );
}

function JoinGamePanel() {
  const [gameCode, setGameCode] = useState<string>('');
  const errors = useActionData();
  const { state: transitionState } = useTransition();
  return (
    <div
      className={classNames(
        'bg-yellow-300',
        'border-8',
        'border-black',
        'rounded-xl',
        'p-4',
        'my-2',
        'group',
        {
          'border-red-500': errors?.gameId,
          'hover:border-green-700': !errors?.gameId,
          'bg-yellow-500':
            transitionState === 'submitting' || transitionState === 'loading',
        }
      )}
    >
      <Form method="post">
        <p className="p-2 text-center group-hover:text-green-700">
          Got a Game Code?
        </p>
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
          disabled={
            !gameCode ||
            transitionState === 'submitting' ||
            transitionState === 'loading'
          }
        >
          Join Game
        </button>
      </Form>
    </div>
  );
}
