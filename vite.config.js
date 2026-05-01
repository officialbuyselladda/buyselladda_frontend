import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {        target: 'http://72.60.102.36:5003',        changeOrigin: true,      },
      '/socket.io': {        target: 'http://72.60.102.36:5003',        ws: true,      }
    }
  }
})

