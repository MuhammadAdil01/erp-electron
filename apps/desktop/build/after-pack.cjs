// Ad-hoc signs the macOS app before it goes into the DMG. Without any signature Apple Silicon Macs
// refuse an Electron app whose bundle was changed while packaging ("the app is damaged"). This is
// not a Developer ID signature (decision D11 is open): the tester still opens it once with
// right-click › Open. CommonJS on purpose: electron-builder loads hooks with require().
/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync } = require('node:child_process');
const path = require('node:path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
};
