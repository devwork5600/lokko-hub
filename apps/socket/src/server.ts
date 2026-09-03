import { createServer } from 'http';

export function createHealthServer() {
  return createServer((req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'socket' }));
      return;
    }

    res.writeHead(404);
    res.end();
  });
}
