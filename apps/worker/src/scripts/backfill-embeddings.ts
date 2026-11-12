import 'dotenv/config';

import { prisma, setListingEmbedding } from '@lokko-hub/db';

import { embedText } from '../embeddings';

// One-off: run after adding the `embedding` column (or after switching
// embedding models — vectors from different models aren't comparable, so a
// model change means every listing needs to go through here again).
//
//   npm run backfill:embeddings -w @lokko-hub/worker
//
// `embedding` is Unsupported in the Prisma client, so it can't be selected or
// filtered on via the normal query builder — raw SQL for both read and write.
async function main() {
  const listings = await prisma.$queryRaw<{ id: string; title: string; description: string }[]>`
    SELECT id, title, description FROM listing WHERE embedding IS NULL AND "deletedAt" IS NULL
  `;

  console.log(`[backfill] ${listings.length} listing(s) without an embedding`);

  let done = 0;
  for (const listing of listings) {
    const vector = await embedText(`${listing.title}\n${listing.description}`);
    await setListingEmbedding(listing.id, vector);
    done++;
    if (done % 25 === 0 || done === listings.length) {
      console.log(`[backfill] ${done}/${listings.length}`);
    }
  }

  console.log('[backfill] done');
}

main()
  .catch((err) => {
    console.error('[backfill] failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
