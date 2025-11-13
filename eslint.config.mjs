// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'node_modules/**',
    'prisma/**',
    'src/generated/prisma/**',
    'next-env.d.ts',
    '*.config.js',
    '*.config.mjs',
  ]),

  {
    rules: {
      // Suppress noisy rules from your lint output
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
    },
  },
]);
