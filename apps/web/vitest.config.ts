import path from 'node:path';

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'node',
    // e2e/ holds Playwright specs, not Vitest ones — both use the .spec.ts
    // suffix by default, and Vitest's test() collides with Playwright's.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
