import { createCookieSessionStorage } from 'remix';

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: '__five_dice',
      sameSite: 'strict',
      httpOnly: true,
    },
  });
