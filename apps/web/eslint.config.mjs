import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-plugin-react's `settings.react.version: 'detect'` (set by eslint-config-next)
    // calls a context.getFilename() that no longer exists on this eslint/eslint-plugin-react
    // combo, crashing the whole run. Pin the version explicitly to skip auto-detection.
    settings: {
      react: {
        version: '19.2.4',
      },
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
