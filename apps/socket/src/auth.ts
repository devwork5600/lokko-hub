import { jwtVerify } from 'jose';

// apps/web signs this token with jose too (lib/auth-token via SignJWT) — same
// HS256 shared-secret scheme on both ends, just one library instead of two.
export async function verifyRoomToken(token: string, secret: string): Promise<string> {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  if (typeof payload.userId !== 'string') {
    throw new Error('Token payload missing userId');
  }
  return payload.userId;
}
