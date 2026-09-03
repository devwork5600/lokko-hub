import { PrismaClient } from '@prisma/client';
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
