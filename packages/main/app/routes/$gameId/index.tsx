import { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import classNames from 'classnames';
import { generateSlug } from 'random-word-slugs';
import { useState } from 'react';
import { Form, json, Link, redirect, useLoaderData } from 'remix';
import { gameExists } from '~/api/game';
import CharacterCarousel, {
  allCharacters,
} from '~/components/CharacterCarousel';
import { commitSession, getSession } from '~/session';

interface LoaderData {
  name: string;
  characterId: number;
}

export function links() {
  return [
    {
      rel: 'preload',
      href: '/_static/images/characters.svg',
      as: 'image',
      type: 'image/svg+xml',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
    },
  ];
}

export const action: ActionFunction = async function action({ request }) {
  const form = await request.formData();
  const name = form.get('name')?.toString();
  const character = form.get('character')?.toString();

  if (!name || !character) {
    throw json({ message: 'Bad Request' }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));
  session.flash('name', name);
  session.flash('character', character);
  return redirect('./lobby', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async function loader({
  params,
}): Promise<Response> {
  const { gameId } = params;
  if (!(await gameExists(gameId))) {
    throw redirect('/');
  }

  return json({
    name: generateSlug(2, {
      format: 'title',
      partsOfSpeech: ['adjective', 'noun'],
    }),
    characterId: Math.floor(65 * Math.random()) % 16,
  });
};

export default function Join() {
  const { name: defaultName, characterId } = useLoaderData<LoaderData>();
  const [name, setName] = useState(defaultName);
  const [character, setCharacter] = useState(allCharacters[characterId]);

  return (
    <main className="bg-yellow-300 rounded-3xl border-black border-8 p-8">
      <div className="uppercase">Welcome!</div>
      <p>Please tell me your name and choose a character</p>
      <div className="w-full">
        <input
          className={classNames('bg-white', 'mx-auto', 'block', 'p-2')}
          name="name"
          value={name}
          placeholder="Your Name"
          onChange={(e) => setName(e.target.value)}
        />
        <CharacterCarousel
          character={character}
          onChange={setCharacter}
          className="w-max mx-auto"
        />
      </div>
      <div className="flex">
        <Form>
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="character" value={character} />
          <button
            className="flex-1 m-2 p-2 bg-green-300 border-8 border-black rounded-xl text-center"
            type="submit"
          >
            Let's go!
          </button>
        </Form>
        <Link
          to="/"
          className="flex-initial m-2 p-2 border-8 border-black rounded-xl"
        >
          Back
        </Link>
      </div>
    </main>
    /* <main className="bg-yellow-300 rounded-3xl border-black border-8 p-8">
        <GameControl
          wsUrl={wsUrl}
          gameId={gameId || ''}
          name={name}
          character={character}
        />
      </main> */
  );
}
