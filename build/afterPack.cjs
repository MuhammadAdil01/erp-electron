// Ad-hoc sign the macOS app before it is put into the DMG. Without any
// signature, Apple Silicon Macs refuse to start an Electron app whose bundle
// was modified during packaging ("app is damaged"). This is NOT a Developer ID
// signature: the tester still has to allow the app once (right-click > Open).
const { execFileSync } = require('node:child_process');
const path = require('node:path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
};
