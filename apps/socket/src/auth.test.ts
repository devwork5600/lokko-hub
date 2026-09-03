import { SignJWT } from 'jose';
import { describe, expect, it } from 'vitest';

import { verifyRoomToken } from './auth';

const SECRET = 'test-secret-at-least-32-bytes-long-ok';

async function sign(payload: Record<string, unknown>, secret = SECRET) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
}

describe('verifyRoomToken', () => {
  it('returns the userId from a validly signed token', async () => {
    const token = await sign({ userId: 'user-1' });
    await expect(verifyRoomToken(token, SECRET)).resolves.toBe('user-1');
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await sign({ userId: 'user-1' }, 'a-completely-different-secret-value');
    await expect(verifyRoomToken(token, SECRET)).rejects.toThrow();
  });

  it('rejects a token whose payload has no userId', async () => {
    const token = await sign({ somethingElse: true });
    await expect(verifyRoomToken(token, SECRET)).rejects.toThrow('missing userId');
  });
});
