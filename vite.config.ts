import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
},
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
