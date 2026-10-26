import { cspPlugin } from '@erp/config/vite-csp';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../..', 'VITE_');
  const apiOrigin = new URL(env.VITE_API_BASE ?? 'http://localhost:3000/api/v1').origin;
  return {
    plugins: [react(), tailwindcss(), cspPlugin({ apiOrigin })],
    // The desktop app loads this build from file://, so its asset paths must be relative; the
    // hosted web app keeps absolute ones for deep links such as /reset/<token>.
    base: process.env.ERP_DESKTOP_BUILD ? './' : '/',
    // VITE_* variables come from the workspace .env
    envDir: '../..',
    server: { port: 5173, strictPort: true },
    preview: { port: 5173, strictPort: true },
  };
});
