import { DataFunctionArgs } from '@remix-run/server-runtime';
import { Provider } from 'react-redux';
import { json, redirect, useLoaderData, useParams } from 'remix';
import { gameExists } from '~/api/game';
import GameControl from '~/components/GameControl';
import { store } from '~/reducers/store';
import { commitSession, getSession } from '~/session';

interface LoaderData {
  wsUrl: string;
  name: string;
  character: string;
}

export function links() {
  return [
    {
      rel: 'preload',
      href: '/_static/images/characters.svg',
      as: 'image',
      type: 'image/svg+xml',
    },
  ];
}

export async function loader({
  params,
  request,
}: DataFunctionArgs): Promise<Response> {
  const { gameId } = params;
  if (!(await gameExists(gameId))) {
    throw redirect('/');
  }

  const session = await getSession(request.headers.get('Cookie'));
  const name = session.get('name');
  const character = session.get('character');
  if (!(name && character)) {
    redirect('./join');
  }

  return json(
    {
      wsUrl: process.env.WS_API || '',
      name,
      character,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
}

export default function Game() {
  const { gameId } = useParams();
  const { wsUrl, name, character } = useLoaderData<LoaderData>();
  return (
    <Provider store={store}>
      <main className="bg-yellow-300 rounded-3xl border-black border-8 p-8">
        <GameControl
          wsUrl={wsUrl}
          gameId={gameId || ''}
          name={name}
          character={character}
        />
      </main>
    </Provider>
  );
}
