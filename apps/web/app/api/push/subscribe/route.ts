import { prisma } from '@lokko-hub/db';
import { NextRequest, NextResponse } from 'next/server';

import { getUser } from '@/lib/auth/auth-session';

// Called by usePushSubscription right after the browser hands back a
// PushSubscription. `endpoint` is unique per browser/device install, so this
// upserts: re-subscribing the same device updates its row instead of
// creating a duplicate one that would receive the same push twice.
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;

  if (typeof endpoint !== 'string' || typeof p256dh !== 'string' || typeof auth !== 'string') {
    return NextResponse.json({ error: 'Invalid push subscription' }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh, auth, userId: user.id, userAgent: req.headers.get('user-agent') },
    create: { endpoint, p256dh, auth, userId: user.id, userAgent: req.headers.get('user-agent') },
  });

  return NextResponse.json({ success: true });
}
