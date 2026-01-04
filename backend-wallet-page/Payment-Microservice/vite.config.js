import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,   // force Vite to use 5173
    open: true    // auto-open browser when dev server starts
  }
})