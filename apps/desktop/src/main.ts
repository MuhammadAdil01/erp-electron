import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  safeStorage,
  shell,
  type IpcMainInvokeEvent,
  type WebContents,
} from 'electron';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DesktopAuth } from './desktop-auth';
import type { DeviceInfo } from './device-info';

// Security baseline: §10.12.3.

const isDev = !app.isPackaged;
const DEV_URL = 'http://localhost:5173';
const WINDOW_TITLE = 'ERP System';
const API_URL = process.env.ERP_API_URL ?? 'http://localhost:3000';

// Packaged builds load the web app shipped as an extra resource (electron-builder.yml).
// ERP_WEB_DIST points a test run at a web build on disk instead of the dev server.
const appUrl = process.env.ERP_WEB_DIST
  ? pathToFileURL(join(process.env.ERP_WEB_DIST, 'index.html')).href
  : isDev
    ? DEV_URL
    : pathToFileURL(join(process.resourcesPath, 'web', 'index.html')).href;

/** True only for the app's own origin (or its files, when packaged). */
function isAppUrl(url: string): boolean {
  try {
    const target = new URL(url);
    const home = new URL(appUrl);
    return home.protocol === 'file:' ? target.protocol === 'file:' : target.origin === home.origin;
  } catch {
    return false;
  }
}

function openInSystemBrowser(url: string): void {
  if (/^https?:\/\//i.test(url)) void shell.openExternal(url);
}

function harden(contents: WebContents): void {
  contents.on('will-navigate', (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    openInSystemBrowser(url);
  });
  contents.on('will-redirect', (event, url) => {
    if (!isAppUrl(url)) event.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => {
    openInSystemBrowser(url);
    return { action: 'deny' };
  });
  contents.on('will-attach-webview', (event) => event.preventDefault());
  if (isDev) {
    contents.on('before-input-event', (_event, input) => {
      if (input.type === 'keyDown' && input.key === 'F12') contents.toggleDevTools();
    });
  }
}

function createWindow(): void {
  const window = new BrowserWindow({
    title: WINDOW_TITLE,
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });
  // Keep the window title fixed, whatever the page sets.
  window.on('page-title-updated', (event) => event.preventDefault());
  window.once('ready-to-show', () => window.show());
  void window.loadURL(appUrl);
}

/** Only the app's own pages may use the bridge. */
function assertAppSender(event: IpcMainInvokeEvent, what: string): void {
  if (!event.senderFrame || !isAppUrl(event.senderFrame.url)) {
    throw new Error(`${what} is only available to the app`);
  }
}

ipcMain.handle('device:info', (event): DeviceInfo => {
  assertAppSender(event, 'device.info');
  return { platform: process.platform, arch: process.arch, appVersion: app.getVersion() };
});

// Sign-in (§10.6): the refresh token stays here, encrypted with the OS key store (safeStorage).
let desktopAuth: DesktopAuth | undefined;
const authFor = () =>
  (desktopAuth ??= new DesktopAuth({
    apiUrl: API_URL,
    dataDir: app.getPath('userData'),
    crypto: safeStorage,
  }));

/** Answers as { ok, value } or { ok: false, error }: IPC would drop an Error's fields. */
function handleAuth<A extends unknown[]>(channel: string, work: (...args: A) => Promise<unknown>) {
  ipcMain.handle(channel, async (event, ...args: unknown[]) => {
    assertAppSender(event, channel);
    try {
      return { ok: true, value: await work(...(args as A)) };
    } catch (error) {
      const e = error as { status?: unknown; problem?: unknown };
      return {
        ok: false,
        error: { status: typeof e.status === 'number' ? e.status : 0, problem: e.problem ?? null },
      };
    }
  });
}

handleAuth('auth:login', (email: string, password: string) =>
  authFor().login(String(email), String(password)),
);
handleAuth(
  'auth:verify-mfa',
  (input: { challenge: string; code?: string; recovery_code?: string }) =>
    authFor().verifyMfa(input),
);
handleAuth('auth:refresh', () => authFor().refresh());
handleAuth('auth:logout', () => authFor().logout());

app.on('web-contents-created', (_event, contents) => harden(contents));

void app.whenReady().then(() => {
  // No default menu on Windows and Linux; macOS keeps its app menu.
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
