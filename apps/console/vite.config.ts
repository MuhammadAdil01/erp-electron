import { cspPlugin } from '@erp/config/vite-csp';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../..', 'VITE_');
  const apiOrigin = new URL(env.VITE_API_BASE ?? 'http://localhost:3000/api/v1').origin;
  return {
    plugins: [react(), tailwindcss(), cspPlugin({ apiOrigin })],
    envDir: '../..',
    server: { port: 5174, strictPort: true },
    preview: { port: 5174, strictPort: true },
  };
});
