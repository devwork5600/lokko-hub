import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';
import { Worker } from 'bullmq';

import { prisma, setListingEmbedding } from '@lokko-hub/db';

import { getRedisConnection } from './redis';

// Multilingual (handles French listings) and matches the vector(384) column
// declared in packages/db/prisma/schema.prisma — changing this model means
// re-backfilling every listing's embedding (see scripts/backfill-embeddings.ts),
// vectors from different models aren't comparable.
const MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

// Lazy + cached: loads the ONNX model weights on first use instead of at
// worker startup, and reuses the same pipeline instance across jobs.
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', MODEL_ID);
  }
  return embedderPromise;
}

export async function embedText(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

export type EmbeddingJobData = { listingId: string };

export async function processEmbeddingJob({ listingId }: EmbeddingJobData) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { title: true, description: true },
  });
  if (!listing) {
    console.warn(`[embedding] listing ${listingId} not found, skipping`);
    return;
  }

  const vector = await embedText(`${listing.title}\n${listing.description}`);
  await setListingEmbedding(listingId, vector);

  console.log(`[embedding] updated embedding for listing ${listingId}`);
}

export function startEmbeddingWorker() {
  const worker = new Worker<EmbeddingJobData>(
    'lokko-hub-embedding-queue',
    (job) => processEmbeddingJob(job.data),
    {
      connection: getRedisConnection(),
      // Same reasoning as the moderation worker: cut idle Redis command volume
      // on Upstash's pay-per-command billing.
      stalledInterval: 300000,
      lockDuration: 300000,
      drainDelay: 30,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[embedding] job ${job?.id} failed:`, err);
  });

  return worker;
}
