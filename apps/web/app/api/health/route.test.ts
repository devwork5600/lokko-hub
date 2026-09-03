import { describe, expect, it, vi } from 'vitest';

const queryRaw = vi.fn();

vi.mock('@lokko-hub/db', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRaw(...args),
  },
}));

describe('GET /api/health', () => {
  it('returns ok when the database responds', async () => {
    queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);

    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok', database: 'up' });
  });

  it('returns 503 when the database is unreachable', async () => {
    queryRaw.mockRejectedValueOnce(new Error('connection refused'));

    const { GET } = await import('./route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ status: 'error', database: 'down' });
  });
});
