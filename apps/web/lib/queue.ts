import { Queue } from 'bullmq';

import { getRedis } from './redis';

const globalForQueue = globalThis as unknown as { listingQueue: Queue | undefined };

export function getListingQueue() {
  if (!globalForQueue.listingQueue) {
    // Namespaced (not just "listing-queue" like lokko-v4) so this never collides
    // with lokko-v4's own worker even if a Redis instance were ever shared.
    globalForQueue.listingQueue = new Queue('lokko-hub-listing-queue', { connection: getRedis() });
  }
  return globalForQueue.listingQueue;
}
