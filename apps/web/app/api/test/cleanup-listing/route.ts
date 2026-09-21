import { NextRequest, NextResponse } from 'next/server';

import { deleteListing } from '@/actions/listing-actions';

// Reuses the real deleteListing action (already covered by its own unit tests) rather than
// re-implementing deletion here — it soft-deletes (sets deletedAt), which is enough to keep
// a listing an E2E run created out of every real query (search, listings feed, the owner's
// own dashboard). Same secret gate as /api/test/login; deleteListing's own ownership check
// (assertOwner) is the second guard — this can only ever delete a listing owned by whichever
// session cookie the request carries, never an arbitrary one by ID alone.
export async function POST(req: NextRequest) {
  const configuredSecret = process.env.E2E_TEST_SECRET;
  const providedSecret = req.headers.get('x-e2e-secret');

  if (!configuredSecret || providedSecret !== configuredSecret) {
    return new NextResponse(null, { status: 404 });
  }

  const { listingId } = (await req.json()) as { listingId?: string };
  if (!listingId) {
    return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
  }

  const result = await deleteListing(listingId);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
