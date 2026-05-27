// ─────────────────────────────────────────────────────────────────────────────
// Playwright configuration — E2E tests
//
// baseURL is http://localhost:5173 (without the Vite base path).
// Tests navigate explicitly to /botc-soundboard-v3/ so the URL is readable.
//
// Browsers: Chromium (Desktop Chrome) + WebKit (Desktop Safari → iOS proxy).
// Firefox is not in the minimum support matrix (see CLAUDE.md).
//
// webServer: starts `npm run dev` and waits for the Vite server to be ready
// at the app's actual URL. `reuseExistingServer` allows reuse on local dev
// so tests can run quickly without a cold start every time.
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/botc-soundboard-v3/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
