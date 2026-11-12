-- Prisma's schema.prisma can't declare an HNSW index (only btree/gist/gin/etc via
-- `@@index(type: ...)`), so the vector similarity index is created here instead.
-- Run after `npm run db:push -w @lokko-hub/db` (and again any time the DB is reset):
--
--   npx prisma db execute --file=prisma/sql/vector-index.sql
--
-- `prisma db push` does not drop indexes it doesn't manage, so this is safe to
-- leave in place across pushes.
CREATE INDEX IF NOT EXISTS listing_embedding_idx
  ON listing
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;
