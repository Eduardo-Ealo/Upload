import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000, // Usa el puerto que Render asigna dinámicamente
  },
});
