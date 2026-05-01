import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // ✅ Load env variables properly
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    // ✅ Safe base URL
    base: env.VITE_BASE_URL || '/',

    plugins: [react()],

    server: {
      proxy: {
        '/api': {
          target: 'http://72.60.102.36:5003',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://72.60.102.36:5003',
          ws: true,
        }
      }
    }
  })
}