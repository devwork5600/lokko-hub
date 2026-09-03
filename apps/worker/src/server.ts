import { createServer } from 'http';

// lokko-v4's worker doesn't listen on any port at all (pure BullMQ consumer). This
// minimal HTTP server exists solely for /health, needed by Railway's health checks.
export function createHealthServer() {
  return createServer((req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'worker' }));
      return;
    }

    res.writeHead(404);
    res.end();
  });
}
