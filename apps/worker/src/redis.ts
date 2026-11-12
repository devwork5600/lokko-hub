import Redis from 'ioredis';

// Same normalization as apps/web/lib/redis.ts. Upstash hands out plain redis://
// connection strings that still require TLS — connecting without upgrading to
// rediss:// doesn't error, it just hangs in ioredis's default (infinite) retry
// loop. Also handles the http(s):// scheme Upstash sometimes uses.
export function getRedisConnection() {
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
