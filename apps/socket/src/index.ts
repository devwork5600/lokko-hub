import 'dotenv/config';

import { createHealthServer } from './server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

createHealthServer().listen(PORT, '0.0.0.0', () => {
  console.log(`[socket] listening on 0.0.0.0:${PORT}`);
});
