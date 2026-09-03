import 'dotenv/config';

import { createHealthServer } from './server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

createHealthServer().listen(PORT, '0.0.0.0', () => {
  console.log(`[worker] listening on 0.0.0.0:${PORT}`);
});
