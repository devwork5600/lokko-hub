import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const ssl =
  connectionString.includes('sslmode=') || connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: pg.Pool | undefined;
};

const pool =
  globalForPrisma.prismaPool ??
  new pg.Pool({
    connectionString,
    ssl,
    max: process.env.NODE_ENV === 'production' ? 5 : 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const prismaPool = pool;

export { Prisma, PrismaClient } from '@prisma/client';
export type * from '@prisma/client';

// `embedding` is declared as Unsupported("vector(384)") in schema.prisma (Prisma
// has no native pgvector type), so it's only readable/writable via raw SQL.

export function toVectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`;
}

export async function setListingEmbedding(listingId: string, values: number[]): Promise<void> {
  const literal = toVectorLiteral(values);
  await prisma.$executeRaw`
    UPDATE listing SET embedding = ${literal}::vector WHERE id = ${listingId}
  `;
}

export type SimilarListingMatch = { id: string; similarity: number };

// Matches GeoSearch.tsx's own DEFAULT_RADIUS_KM (apps/web) — same definition of
// "local" used for the regular geo search filter.
const DEFAULT_SIMILAR_RADIUS_METERS = 20_000;

// Cosine distance (`<=>`) matches the HNSW index built with vector_cosine_ops
// in prisma/sql/vector-index.sql — querying with a different operator would
// silently skip the index and fall back to a full scan.
//
// Hard radius filter rather than a blended score: simpler to reason about, and
// this is a local-goods marketplace, so "same kind of product nearby" beats
// "same kind of product somewhere in the country". Falls back to unfiltered
// results to fill out `limit` when the area is too sparse, so the section
// never renders mostly-empty.
export async function findSimilarListingIds(
  listingId: string,
  limit = 10,
  radiusMeters = DEFAULT_SIMILAR_RADIUS_METERS,
): Promise<SimilarListingMatch[]> {
  const nearby = await prisma.$queryRaw<SimilarListingMatch[]>`
    SELECT other.id, 1 - (self.embedding <=> other.embedding) AS similarity
    FROM listing self
    JOIN location self_loc ON self_loc.id = self."locationId"
    JOIN listing other
      ON other.id != self.id
     AND other.status = 'ACTIVE'
     AND other."deletedAt" IS NULL
     AND other.embedding IS NOT NULL
    JOIN location other_loc ON other_loc.id = other."locationId"
    WHERE self.id = ${listingId}
      AND self.embedding IS NOT NULL
      AND ST_DWithin(self_loc.coords, other_loc.coords, ${radiusMeters})
    ORDER BY self.embedding <=> other.embedding
    LIMIT ${limit}
  `;

  if (nearby.length >= limit) return nearby;

  const excludeIds = nearby.map((m) => m.id);
  const rest = await prisma.$queryRaw<SimilarListingMatch[]>`
    SELECT other.id, 1 - (self.embedding <=> other.embedding) AS similarity
    FROM listing self
    JOIN listing other
      ON other.id != self.id
     AND other.status = 'ACTIVE'
     AND other."deletedAt" IS NULL
     AND other.embedding IS NOT NULL
    WHERE self.id = ${listingId}
      AND self.embedding IS NOT NULL
      ${excludeIds.length > 0 ? Prisma.sql`AND other.id NOT IN (${Prisma.join(excludeIds)})` : Prisma.empty}
    ORDER BY self.embedding <=> other.embedding
    LIMIT ${limit - nearby.length}
  `;

  return [...nearby, ...rest];
}
