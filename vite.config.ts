import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Installable PWA. autoUpdate keeps the service worker fresh; the manifest below
// drives the Android/iOS "Add to Home Screen" install. Replace the placeholder
// icons in /public/icons with real 192/512 PNGs before shipping (see README).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'assets/logo-banner.png', 'assets/logo-icon.png'],
      manifest: {
        name: 'Radar — Understand once. Remember forever.',
        short_name: 'Radar',
        description: 'Your second brain. Understand once, remember forever.',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell. (API responses aren't cached yet — that's a
        // later offline-support pass; runtime caching goes here when we add it.)
        globPatterns: ['**/*.{js,css,html,svg,png,jpeg,woff2}'],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173 },
});
