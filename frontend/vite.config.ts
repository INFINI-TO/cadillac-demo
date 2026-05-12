import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { DEV_BACKEND_URL_FALLBACK } from './src/config/urlDefaults'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || DEV_BACKEND_URL_FALLBACK,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
