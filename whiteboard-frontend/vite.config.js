/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const BACKEND = env.VITE_BACKEND_URL || 'http://localhost:8000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: BACKEND,
          changeOrigin: true,
        },
        '/socket.io': {
          target: BACKEND,
          ws: true,
          changeOrigin: true,
        }
      }
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') }
    }
  };
});
