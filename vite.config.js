import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/anitrack-app/',
  define: {
    'process.env.BASE_URL': JSON.stringify('/anitrack-app')
  }
})