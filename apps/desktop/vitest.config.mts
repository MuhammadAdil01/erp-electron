import { defineConfig } from 'vitest/config';

// Unit tests only; the Playwright smoke test in e2e/ runs with `pnpm test:smoke`.
export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
