import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  // Add these configurations:
  server: {
    historyApiFallback: true,
    // Ensures Vite dev server handles SPA routing
  },
  preview: {
    historyApiFallback: true,
    // Ensures preview server handles SPA routing
  },
  build: {
    outDir: 'dist',
    // Explicitly set output directory
  },
  base: './',
  // Use relative paths for better compatibility with various hosting
})