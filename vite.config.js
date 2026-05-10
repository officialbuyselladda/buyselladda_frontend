import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // Load env variables properly
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    // Safe base URL
    base: env.VITE_BASE_URL || '/',

    plugins: [react()],

server: {
      port: env.VITE_PORT || 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: 'http://localhost:5000',
          ws: true,
          secure: false,
        }
      }
    },

    build: {
      // Production build configuration
      outDir: 'dist',
      sourcemap: false,
    },

    // Ensure proper MIME types for production
    preview: {
      port: env.VITE_PORT || 4173,
    }
  })
}
