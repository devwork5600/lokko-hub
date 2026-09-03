import type { Server } from 'http';
import type { AddressInfo } from 'net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createHealthServer } from './server';

describe('socket health server', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createHealthServer();
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('GET /health returns ok', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok', service: 'socket' });
  });

  it('returns 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/unknown`);
    expect(response.status).toBe(404);
  });
});
