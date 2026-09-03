import { createServer } from 'http';
import { Server } from 'socket.io';

import { verifyRoomToken } from './auth';
import { createPresenceRegistry } from './presence';

export function createSocketServer({
  corsOrigin,
  broadcastSecret,
  authSecret,
}: {
  corsOrigin: string;
  broadcastSecret: string;
  authSecret: string;
}) {
  const presence = createPresenceRegistry();

  const httpServer = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-broadcast-secret');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'socket' }));
      return;
    }

    // Internal endpoint: other services (apps/web, apps/worker) push events to
    // a specific user's private room. Not exposed publicly — protected by a
    // shared secret, not user auth.
    if (req.url === '/broadcast' && req.method === 'POST') {
      if (req.headers['x-broadcast-secret'] !== broadcastSecret) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const { userId, event, payload } = JSON.parse(body);
          if (!userId || !event) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing userId or event' }));
            return;
          }

          io.to(`user:${userId}`).emit(event, payload);
          const online = presence.isOnline(userId);
          console.log(`[socket] broadcast -> user:${userId} | event=${event} | online=${online}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, online }));
        } catch (err) {
          console.error('[socket] broadcast body parse error:', err);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST'], credentials: true },
  });

  io.on('connection', (socket) => {
    let registeredUserId: string | null = null;

    socket.on('room:join', async ({ userId, token }: { userId: string; token: string }) => {
      if (!userId || !token) return;

      try {
        const verifiedUserId = await verifyRoomToken(token, authSecret);
        if (verifiedUserId !== userId) {
          console.warn(`[socket] auth mismatch for ${socket.id}`);
          return;
        }

        registeredUserId = userId;
        presence.addUser(userId, socket.id);
        socket.join(`user:${userId}`);
        io.emit('user:online', { userId });
      } catch (err) {
        console.error(`[socket] auth failed for ${socket.id}:`, (err as Error).message);
      }
    });

    socket.on('user:status', (targetUserId: string, callback: (online: boolean) => void) => {
      if (typeof callback === 'function') callback(presence.isOnline(targetUserId));
    });

    socket.on('room:leave', (userId: string) => {
      if (!userId) return;
      presence.removeUser(userId, socket.id);
      socket.leave(`user:${userId}`);
      if (!presence.isOnline(userId)) io.emit('user:offline', { userId });
    });

    socket.on('disconnect', () => {
      if (registeredUserId) {
        presence.removeUser(registeredUserId, socket.id);
        if (!presence.isOnline(registeredUserId)) {
          io.emit('user:offline', { userId: registeredUserId });
        }
      }
    });
  });

  return { httpServer, io, presence };
}
