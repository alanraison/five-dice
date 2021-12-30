import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { Outlet, redirect, useLoaderData, useParams } from 'remix';
import { gameExists } from '~/api/game';
import Lobby from '~/components/Lobby';
import { useWebSocket } from '~/hooks/websocket';
import { ReducerProvider } from '~/reducers/context';
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
      href: 'images/characters.svg',
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
  const [state, dispatch] = useWebSocket(wsUrl, gameId || '', {
    name,
    character,
  });
  return (
    <ReducerProvider>
      <main className="bg-yellow-300 rounded-3xl border-black border-8 p-8">
        {(() => {
          switch (state.state) {
            case 'pending':
              return (
                <Lobby
                  players={state.allPlayers}
                  player={{ name, character }}
                />
              );
            default:
              return null;
          }
        })()}
      </main>
    </ReducerProvider>
  );
}
