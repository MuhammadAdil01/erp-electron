import { defineConfig } from '@playwright/test';

// The desktop smoke test (Part 12 §12.11): the built app starts and shows the sign-in screen.
// Run after `pnpm build` here and an ERP_DESKTOP_BUILD=1 build of apps/web.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
});
