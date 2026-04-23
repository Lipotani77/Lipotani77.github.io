import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        gallery: path.resolve(__dirname, 'gallery.html'),
        contact: path.resolve(__dirname, 'contact.html')
      }
    }
  }
});
