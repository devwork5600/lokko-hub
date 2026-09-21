import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@lokko-hub/db';

import { testAuth } from '@/lib/auth/test-auth';

// Lets Playwright log in as a dedicated E2E test account without clicking a real magic-link
// email — there is no UI-free way to complete that flow, and no other sign-in method exists
// on this app. Gated on E2E_TEST_SECRET alone, not NODE_ENV: Vercel sets NODE_ENV=production
// on preview deployments too, and this needs to work against wherever PLAYWRIGHT_BASE_URL
// actually points (including the real deployed site, per the existing e2e/sign-in.spec.ts
// convention) — an env check would just make it always refuse there.
//
// The real boundary is the secret itself: without it (or with a wrong one) this 404s, and
// even a leaked/guessed secret only ever signs in as E2E_TEST_USER_EMAIL — a dedicated dummy
// account, never an arbitrary real user. Keep E2E_TEST_SECRET long, random, and only in
// GitHub Actions secrets / Vercel env vars, never committed.
export async function POST(req: NextRequest) {
  const configuredSecret = process.env.E2E_TEST_SECRET;
  const providedSecret = req.headers.get('x-e2e-secret');

  if (!configuredSecret || providedSecret !== configuredSecret) {
    return new NextResponse(null, { status: 404 });
  }

  const email = process.env.E2E_TEST_USER_EMAIL;
  if (!email) {
    return NextResponse.json({ error: 'E2E_TEST_USER_EMAIL is not set' }, { status: 500 });
  }

  // Self-provisioning: creates the dummy account on first use instead of requiring a
  // separate seed step, and reuses it (never duplicated) on every later run.
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'E2E Test User', emailVerified: true },
  });

  const ctx = await testAuth.$context;
  const { cookies } = await ctx.test.login({ userId: user.id });

  return NextResponse.json({ cookies });
}
