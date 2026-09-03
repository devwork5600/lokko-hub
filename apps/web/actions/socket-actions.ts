'use server';

import { SignJWT } from 'jose';

import { getUser } from '@/lib/auth/auth-session';

export async function getSocketToken() {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const secret = process.env.SOCKET_AUTH_SECRET;
  if (!secret) {
    throw new Error('SOCKET_AUTH_SECRET environment variable is not set');
  }

  return new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
}
