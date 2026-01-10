import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:5081',
            changeOrigin: true,
            secure: false,
          },
          '/socket.io': {
            target: 'http://localhost:5081',
            ws: true,
            changeOrigin: true
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'date-fns'],
            core: ['socket.io-client', 'uuid'],
            ai: ['@google/genai']
          }
        }
      }
    },
    resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
