// ─────────────────────────────────────────────────────────────────────────────
// Playwright configuration — E2E tests
//
// baseURL is http://localhost:5173 (without the Vite base path).
// Tests navigate explicitly to /botc-soundboard-v3/ so the URL is readable.
//
// Projects:
//   smoke        — 5 smoke specs × Chromium (fast, ~10s)
//   smoke-webkit — same 5 specs × WebKit (iOS Safari proxy)
//   full         — 6 full-suite specs × Chromium only (slice-3 coverage, ~90s)
//   mobile       — touch-wiring, target sizes, overflow × WebKit/iPhone 13 Pro (~30s)
//   visual       — screenshot regression specs × Chromium (local-only, NOT in CI)
//
// Default `playwright test` (no flags) runs all five projects.
// Use --project=<name> to run a subset.
//
// webServer: starts `npm run dev` and waits for the Vite server to be ready
// at the app's actual URL. `reuseExistingServer` allows reuse on local dev
// so tests can run quickly without a cold start every time.
// ─────────────────────────────────────────────────────────────────────────────

import { defineConfig, devices } from '@playwright/test';

const SMOKE_TESTS = [
  'app-loads',
  'library-empty',
  'board-list-empty',
  'board-create',
  'mode-toggle',
];
const FULL_TESTS = [
  'board-crud',
  'scene-crud',
  'pad-creation',
  'pad-editing',
  'pad-dnd',
  'game-mode',
  'audio',
];

const smokeMatch = new RegExp(
  `tests/e2e/(${SMOKE_TESTS.join('|')})\\.spec\\.ts$`,
);
const fullMatch = new RegExp(
  `tests/e2e/(${FULL_TESTS.join('|')})\\.spec\\.ts$`,
);

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
  expect: {
    toHaveScreenshot: {
      // Allow very small pixel-level differences (font subpixel rendering).
      // macOS-only: baselines are NOT committed for CI (different font stack).
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
  },
  projects: [
    {
      name: 'smoke',
      testMatch: smokeMatch,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'smoke-webkit',
      testMatch: smokeMatch,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'full',
      testMatch: fullMatch,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // iPhone 13 Pro: viewport 390×844, hasTouch: true, isMobile: true,
      // deviceScaleFactor: 3, defaultBrowserType: webkit.
      // Covers touch-wiring (tap() events), touch target sizes, overflow.
      // File-picker, audio output, Ringer Switch: see docs/MANUAL_IPHONE_CHECKLIST.md.
      name: 'mobile',
      testMatch: /tests\/e2e\/mobile\/.*\.spec\.ts$/,
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'visual',
      testMatch: /tests\/e2e\/visual\/.*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/botc-soundboard-v3/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
