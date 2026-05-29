import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pinboard-xmr7.vercel.app/:8000',
        changeOrigin: true,
      },
    },
  },
})
