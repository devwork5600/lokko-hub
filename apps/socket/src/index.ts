import 'dotenv/config';

import { createSocketServer } from './socket-server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const CORS_ORIGIN = process.env.NEXT_PUBLIC_URL;
const BROADCAST_SECRET = process.env.SOCKET_BROADCAST_SECRET;
const AUTH_SECRET = process.env.SOCKET_AUTH_SECRET;

if (!CORS_ORIGIN || !BROADCAST_SECRET || !AUTH_SECRET) {
  throw new Error(
    'NEXT_PUBLIC_URL / SOCKET_BROADCAST_SECRET / SOCKET_AUTH_SECRET environment variables are not set',
  );
}

const { httpServer } = createSocketServer({
  corsOrigin: CORS_ORIGIN,
  broadcastSecret: BROADCAST_SECRET,
  authSecret: AUTH_SECRET,
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[socket] listening on 0.0.0.0:${PORT}`);
  console.log(`[socket] CORS allowed origin -> ${CORS_ORIGIN}`);
});
