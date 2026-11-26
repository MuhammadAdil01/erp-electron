import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Where the main process sends sign-in calls. A test run sets ERP_API_URL; an installer carries
// the address it was built for in its package.json (`erpApiUrl`, written by the installers
// workflow); development uses the local API.

export const DEV_API_URL = 'http://localhost:3000';

export function resolveApiUrl(options: {
  env: NodeJS.ProcessEnv;
  packaged: boolean;
  /** The app's folder (app.getAppPath()): the asar archive of an installed build. */
  appPath: string;
  read?: (path: string) => string;
}): string {
  const fromEnv = options.env.ERP_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (options.packaged) {
    const read = options.read ?? ((path: string) => readFileSync(path, 'utf8'));
    try {
      const pkg = JSON.parse(read(join(options.appPath, 'package.json'))) as {
        erpApiUrl?: unknown;
      };
      if (typeof pkg.erpApiUrl === 'string' && /^https?:\/\/[^\s]+$/.test(pkg.erpApiUrl)) {
        return pkg.erpApiUrl.replace(/\/+$/, '');
      }
    } catch {
      // No readable address in the package: fall back to the local API.
    }
  }
  return DEV_API_URL;
}
