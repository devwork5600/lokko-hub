import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { testUtils } from 'better-auth/plugins';

import { prisma } from '@lokko-hub/db';

// Test-only auth instance — never imported by production code, only by
// app/api/test/login/route.ts. Kept in its own file per the plugin's own recommendation:
// conditionally spreading testUtils() into the real auth.ts's plugins array breaks
// TypeScript's inference on ctx.test, and would ship the plugin in the real build regardless
// of any env check around it. Named test-auth.ts, not auth.test.ts — the latter matches
// Vitest's default test-file glob, which tried to run this as a spec (see vitest.config.ts).
//
// Same secret and baseURL as the real instance (lib/auth/auth.ts) — testUtils signs the
// session cookie with `secret` (HMAC), and the cookie's domain defaults to `baseURL`'s
// hostname, so both must match for the session this creates to validate against the real
// app and land on the right domain.
export const testAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [testUtils()],
});
