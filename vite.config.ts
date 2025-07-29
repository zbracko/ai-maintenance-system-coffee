// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  /**  Tell Vite that any “*.srt” file is a static asset.
   *   • Harmless in production (videos now load from S3 via presigned URLs)
   *   • Still essential for local dev builds if you keep demo clips in /src/videos
   */
  assetsInclude: ['**/*.srt'],

  // existing polyfills
  define: {
    global: 'window',
    'process.env': {},          // basic env shim for libraries that expect it
  },
  optimizeDeps: {
    include: ['buffer', 'process'], // same as before
  },

  // dev‑server tweaks (unchanged)
  server: {
    host: true,                 // allows access by LAN IP
    allowedHosts: ['.loca.lt'], // let you tunnel via *.loca.lt
  },
});
