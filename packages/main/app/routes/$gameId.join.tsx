import { DataFunctionArgs } from '@remix-run/server-runtime';
import classNames from 'classnames';
import { generateSlug } from 'random-word-slugs';
import { useState } from 'react';
import { Form, Link, redirect, useActionData, useLoaderData } from 'remix';
import { nameTaken } from '~/api/game';
import CharacterCarousel, {
  allCharacters,
} from '~/components/CharacterCarousel';
import { getSession, commitSession } from '~/session';
import logger from '~/logger';

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

export async function action({ params, request }: DataFunctionArgs) {
  const { gameId } = params;
  const formData = await request.formData();
  if (!gameId) {
    throw new Error('no game id found');
  }
  const character = formData.get('character');
  if (!character) {
    logger.debug(params);
    throw new Error('no character found');
  }
  const name = formData.get('name');
  if (!name) {
    return {
      name: 'A name must be supplied',
    };
  }
  if (await nameTaken(gameId, name.toString())) {
    return {
      name: 'That name has already been used in this game',
    };
  }
  const session = await getSession(request.headers.get('Cookie'));
  session.flash('name', name.toString());
  session.flash('character', character.toString());
  return redirect(`/${encodeURIComponent(gameId)}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function loader() {
  return {
    name: generateSlug(2, {
      format: 'title',
      partsOfSpeech: ['adjective', 'noun'],
    }),
    characterId: Math.floor(65 * Math.random()) % 16,
  };
}

export default function JoinGame() {
  const errors = useActionData();
  const { name: defaultName, characterId } =
    useLoaderData<{ name: string; characterId: number }>();
  const [name, setName] = useState(defaultName);
  const [character, setCharacter] = useState(allCharacters[characterId]);

  return (
    <main className="bg-yellow-300 rounded-3xl border-black border-8 p-8">
      <div className="uppercase">Welcome!</div>
      Please tell me your name and choose a character
      <div className="w-full">
        <input
          className={classNames('bg-white', 'mx-auto', 'block', 'p-2', {
            'bg-red-300': errors?.name,
          })}
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
      <Form method="post">
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="character" value={character} />
        <div className="flex">
          <button
            className="flex-1 m-2 p-2 bg-green-300 border-8 border-black rounded-xl"
            type="submit"
          >
            Let's go!
          </button>
          <Link
            to="/"
            className="flex-initial m-2 p-2 border-8 border-black rounded-xl"
          >
            Back
          </Link>
        </div>
      </Form>
    </main>
  );
}
