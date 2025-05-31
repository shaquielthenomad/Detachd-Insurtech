import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimize bundle size
        minify: 'terser',
        sourcemap: false, // Disable sourcemaps in production
        rollupOptions: {
          output: {
            // Split vendor chunks to improve caching
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              ui: ['@mui/material', '@mui/icons-material'],
              utils: ['lucide-react', 'html2canvas']
            },
            // Optimize chunk file names
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        },
        // Set reasonable chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable compression
        reportCompressedSize: true
      }
    };
});
