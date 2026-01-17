import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4999,
    open: true,
    proxy: {
      '/api': {
        // In development, proxy to localhost:8080
        // In production build, this proxy is not used (API calls use absolute URLs)
        target: process.env.NODE_ENV === 'production'
          ? 'https://api.funnelseye.com'
          : 'http://localhost:8080',
        changeOrigin: true,
        secure: false, // Allow self-signed certs in dev
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
