import { _electron as electron, expect, test } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// The built desktop app opens on the sign-in screen, with the security baseline of §10.12.3:
// no Node in the page, only the preload bridge, and no refresh token anywhere the page can read.
// With ERP_DESKTOP_EXECUTABLE set (the installers workflow), the packaged app is started instead:
// its own web files and the API address it was built for, so a package that misses a runtime
// dependency fails here rather than on a tester's computer.

const desktop = resolve(__dirname, '..');
const webDist = resolve(desktop, '../web/dist');
const packaged = process.env.ERP_DESKTOP_EXECUTABLE;
const userData = () => `--user-data-dir=${mkdtempSync(join(tmpdir(), 'erp-smoke-'))}`;

test('opens on the sign-in screen with only the bridge exposed', async () => {
  // Without the test-run overrides; ELECTRON_RUN_AS_NODE (set by VS Code) would start plain Node.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      (e): e is [string, string] =>
        e[1] !== undefined &&
        !['ERP_API_URL', 'ERP_WEB_DIST', 'ELECTRON_RUN_AS_NODE'].includes(e[0]),
    ),
  );
  const app = await electron.launch(
    packaged
      ? { executablePath: packaged, args: [userData()], env }
      : {
          args: [join(desktop, 'dist/main.js'), userData()],
          env: { ...env, ERP_WEB_DIST: webDist, ERP_API_URL: 'http://localhost:3000' },
        },
  );
  const window = await app.firstWindow();
  await expect(window.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 30_000 });
  await expect(window.getByLabel('E-mail')).toBeVisible();
  expect(
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.getTitle()),
  ).toBe('ERP System');

  const page = await window.evaluate(() => ({
    node: typeof (globalThis as { require?: unknown }).require,
    process: typeof (globalThis as { process?: unknown }).process,
    bridge: Object.keys((globalThis as { erp?: { auth?: object } }).erp?.auth ?? {}).sort(),
    storage: Object.keys(localStorage).concat(Object.keys(sessionStorage)),
    cookies: document.cookie,
  }));
  expect(page.node).toBe('undefined');
  expect(page.process).toBe('undefined');
  expect(page.bridge).toEqual(['login', 'logout', 'refresh', 'verifyMfa']);
  expect(page.storage.filter((k) => /refresh|token/i.test(k))).toEqual([]);
  expect(page.cookies).toBe('');
  await window.screenshot({ path: 'test-results/desktop-sign-in.png' });
  await app.close();
});
