import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor code into its own chunk
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('tailwindcss')) return 'vendor-tailwind';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500 // increase the limit from 500 to avoid warning
  }
});
