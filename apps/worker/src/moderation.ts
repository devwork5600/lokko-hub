import { Worker } from 'bullmq';
import Redis from 'ioredis';

import { prisma } from '@lokko-hub/db';

import { matchSavedSearches } from './notifications';

// Same normalization as apps/web/lib/redis.ts. Upstash hands out plain redis://
// connection strings that still require TLS — connecting without upgrading to
// rediss:// doesn't error, it just hangs in ioredis's default (infinite) retry
// loop. Also handles the http(s):// scheme Upstash sometimes uses.
function getRedisConnection() {
  const rawUrl = process.env.UPSTASH_REDIS_URL;
  if (!rawUrl) {
    throw new Error('UPSTASH_REDIS_URL environment variable is not set');
  }

  const url = rawUrl.startsWith('https://')
    ? rawUrl.replace('https://', 'rediss://')
    : rawUrl.startsWith('http://')
      ? rawUrl.replace('http://', 'redis://')
      : rawUrl.startsWith('redis://') && rawUrl.includes('upstash.io')
        ? rawUrl.replace('redis://', 'rediss://')
        : rawUrl;

  return new Redis(url, {
    maxRetriesPerRequest: null, // required by BullMQ
    tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  });
}

type ClassifyResponse = {
  status: 'done' | 'pending' | 'error';
  jobId?: string;
  result?: { label: string; score: number }[];
};

async function classifyImage(imageUrl: string): Promise<string> {
  const apiUrl = process.env.NSFW_API_URL;
  const apiKey = process.env.NSFW_API_KEY;
  if (!apiUrl || !apiKey) {
    throw new Error('NSFW_API_URL / NSFW_API_KEY environment variables are not set');
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.status}`);
  const blob = await imageResponse.blob();

  const formData = new FormData();
  formData.append('image', blob);

  const response = await fetch(`${apiUrl}/classify`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: formData,
  });
  if (!response.ok) throw new Error(`NSFW API request failed: ${response.status}`);

  let result = (await response.json()) as ClassifyResponse;

  // The API can respond with a pending job for slower cases — poll for the result.
  let attempts = 0;
  while (result.status === 'pending' && result.jobId && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pollResponse = await fetch(`${apiUrl}/result/${result.jobId}`, {
      headers: { 'x-api-key': apiKey },
    });
    if (pollResponse.ok) result = (await pollResponse.json()) as ClassifyResponse;
    attempts++;
  }

  // `result` is sorted by score descending — the top label is the classification.
  return result.result?.[0]?.label ?? 'unknown';
}

export type ListingJobData = {
  listingId: string;
  images: string[];
  isNew?: boolean;
};

export async function processListingJob({ listingId, images, isNew }: ListingJobData) {
  console.log(`[moderation] processing listing ${listingId} (${images.length} image(s))`);

  let hasNsfw = false;
  const results: { image: string; label: string }[] = [];

  for (const imageUrl of images) {
    try {
      const label = await classifyImage(imageUrl);
      if (label === 'nsfw') hasNsfw = true;
      results.push({ image: imageUrl, label });

      await prisma.listingImage.updateMany({
        where: { listingId, url: imageUrl },
        data: { status: label === 'nsfw' ? 'NSFW' : 'SAFE' },
      });
    } catch (err) {
      console.error(`[moderation] classification failed for ${imageUrl}:`, err);
      results.push({ image: imageUrl, label: 'error' });
    }
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      status: hasNsfw ? 'REJECTED' : 'ACTIVE',
      rejectionReason: hasNsfw ? 'Image flagged as inappropriate content' : null,
      nsfwResults: results,
    },
  });

  console.log(`[moderation] listing ${listingId} -> ${hasNsfw ? 'REJECTED' : 'ACTIVE'}`);

  // Only check saved searches for genuinely new listings — re-moderation on an
  // edit (isNew: false) shouldn't re-notify everyone who already saw this listing.
  if (isNew && !hasNsfw) {
    try {
      await matchSavedSearches(listingId);
    } catch (err) {
      console.error(`[moderation] saved-search matching failed for ${listingId}:`, err);
    }
  }
}

export function startModerationWorker() {
  const worker = new Worker<ListingJobData>(
    'lokko-hub-listing-queue',
    (job) => processListingJob(job.data),
    { connection: getRedisConnection() },
  );

  worker.on('failed', (job, err) => {
    console.error(`[moderation] job ${job?.id} failed:`, err);
  });

  return worker;
}
