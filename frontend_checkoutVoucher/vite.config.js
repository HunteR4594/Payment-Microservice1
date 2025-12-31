import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5259', // Updated to match launchSettings port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
  },
})
