import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, every /api request is forwarded to Spring Boot, so no CORS setup is needed while developing.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
});
