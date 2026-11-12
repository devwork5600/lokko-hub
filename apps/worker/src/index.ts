import 'dotenv/config';

import { startEmbeddingWorker } from './embeddings';
import { startModerationWorker } from './moderation';
import { createHealthServer } from './server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

createHealthServer().listen(PORT, '0.0.0.0', () => {
  console.log(`[worker] listening on 0.0.0.0:${PORT}`);
});

startModerationWorker();
console.log('[worker] moderation worker started');

startEmbeddingWorker();
console.log('[worker] embedding worker started');
