import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for "Slip It".
 *
 * Run all tests   : npx playwright test
 * Interactive UI  : npx playwright test --ui
 * Show report     : npx playwright show-report
 */
export default defineConfig({
  testDir: './e2e/tests',

  // Use the dedicated e2e tsconfig (CommonJS/node resolution, no Angular compiler)
  tsconfig: './tsconfig.e2e.json',

  // Each test gets an isolated browser context (Playwright ≥ 1.35 default),
  // so localStorage is never shared between tests — safe to run in parallel.
  // The dev server is stateless (pure client-side PWA) → no shared server state.
  fullyParallel: true,
  workers: process.env['CI'] ? 2 : 4,

  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 1,  // 1 retry locally handles rare Ionic animation flakiness

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Extra timeout for Ionic animations
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command:
      'node node_modules/@angular/cli/bin/ng.js serve --configuration development --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
