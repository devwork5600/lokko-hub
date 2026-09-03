import type { Server } from 'http';
import type { AddressInfo } from 'net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createSocketServer } from './socket-server';

const BROADCAST_SECRET = 'test-broadcast-secret';

describe('socket server HTTP layer', () => {
  let httpServer: Server;
  let baseUrl: string;

  beforeAll(async () => {
    ({ httpServer } = createSocketServer({
      corsOrigin: 'http://localhost:3000',
      broadcastSecret: BROADCAST_SECRET,
      authSecret: 'test-auth-secret',
    }));
    await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
    const { port } = httpServer.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  it('GET /health returns ok', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', service: 'socket' });
  });

  it('POST /broadcast without the secret is rejected', async () => {
    const response = await fetch(`${baseUrl}/broadcast`, {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-1', event: 'test' }),
    });
    expect(response.status).toBe(401);
  });

  it('POST /broadcast with the secret and no connected socket reports offline', async () => {
    const response = await fetch(`${baseUrl}/broadcast`, {
      method: 'POST',
      headers: { 'x-broadcast-secret': BROADCAST_SECRET },
      body: JSON.stringify({ userId: 'user-1', event: 'notification:new', payload: {} }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, online: false });
  });

  it('POST /broadcast with a missing userId is rejected', async () => {
    const response = await fetch(`${baseUrl}/broadcast`, {
      method: 'POST',
      headers: { 'x-broadcast-secret': BROADCAST_SECRET },
      body: JSON.stringify({ event: 'test' }),
    });
    expect(response.status).toBe(400);
  });
});
