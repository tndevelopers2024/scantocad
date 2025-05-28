import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    outDir: 'dist',
    // Generate manifest.json for better caching
    manifest: true
  },
  // For Netlify, you might want to use './' or your project name if in subdirectory
  base: process.env.NODE_ENV === 'production' ? './' : '/'
})