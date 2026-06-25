/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@/types': '/src/features/ticketing/types',
      '@/lib': '/src/features/ticketing/lib',
      '@/components': '/src/features/ticketing/components',
      '@/contexts': '/src/features/ticketing/contexts',
      '@/hooks': '/src/features/ticketing/hooks',
      '@/pages': '/src/features/ticketing/pages',
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
