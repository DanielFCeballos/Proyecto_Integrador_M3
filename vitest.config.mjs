import { defineConfig } from 'vitest/config';

export default defineConfig({
  envDir: false,
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.mjs'],
    exclude: ['**/node_modules/**', '**/.git/**', '**/.respaldos/**', '**/dist/**'],
    setupFiles: ['tests/unit/setup.mjs'],
    reporters: ['verbose'],
  },
});
