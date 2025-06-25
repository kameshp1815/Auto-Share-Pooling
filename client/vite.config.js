import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true,
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
    
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
