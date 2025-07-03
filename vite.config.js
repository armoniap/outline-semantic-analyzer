import { defineConfig } from 'vite';

export default defineConfig({
  base: '/outline-semantic-analyzer/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});