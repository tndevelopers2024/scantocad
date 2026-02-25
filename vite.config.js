import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],

  base: '/',

  server: {
    proxy: {
      '/api/v1': {
        target: 'https://api.convertscantocad.com',
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: 'https://api.convertscantocad.com',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      '/uploads': {
        target: 'https://api.convertscantocad.com',
        changeOrigin: true,
        secure: true,
      },
      '/completed_files': {
        target: 'https://api.convertscantocad.com',
        changeOrigin: true,
        secure: true,
      },
    }
  }
})