import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      __RESTAURENT_ID__: JSON.stringify(env.VITE_RESTAURENT_ID || ''),
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || env.VITE_API_URL || '')
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    }
  }
})
