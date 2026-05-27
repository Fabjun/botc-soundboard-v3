// ─────────────────────────────────────────────────────────────────────────────
// Vitest configuration — separate from vite.config.ts intentionally:
//   - vite.config.ts includes vite-plugin-pwa (build-only, breaks in test mode)
//   - Test environment uses jsdom, not the Vite dev server
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['tests/unit/setup.ts'],
  },
});
