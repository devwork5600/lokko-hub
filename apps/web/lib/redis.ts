import Redis from 'ioredis';

// Upstash hands out plain redis:// connection strings that still require TLS —
// connecting without upgrading to rediss:// doesn't error, it just hangs in
// ioredis's default (infinite) retry loop. Also handles the http(s):// scheme
// Upstash sometimes uses instead.
function getRedisUrl() {
  const rawUrl = process.env.UPSTASH_REDIS_URL;
  if (!rawUrl) {
    throw new Error('UPSTASH_REDIS_URL environment variable is not set');
  }

  if (rawUrl.startsWith('https://')) return rawUrl.replace('https://', 'rediss://');
  if (rawUrl.startsWith('http://')) return rawUrl.replace('http://', 'redis://');
  if (rawUrl.startsWith('redis://') && rawUrl.includes('upstash.io')) {
    return rawUrl.replace('redis://', 'rediss://');
  }
  return rawUrl;
}

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export function getRedis() {
  if (!globalForRedis.redis) {
    const redisUrl = getRedisUrl();

    globalForRedis.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // required by BullMQ
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    });

    globalForRedis.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  return globalForRedis.redis;
}
