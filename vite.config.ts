import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.jpg',
        'apple-touch-icon.jpg',
        'icons/icon-192.jpg',
        'icons/icon-512.jpg',
        'icons/icon-512-maskable.jpg',
        'assets/logo.jpeg',
        'assets/logo-wide.jpeg',
        'assets/logo-icon.jpeg',
      ],
      manifest: {
        name: 'Radar — Understand once. Remember forever.',
        short_name: 'Radar',
        description: 'Your second brain. Understand once, remember forever.',
        start_url: '/',
        display: 'standalone',
        background_color: '#1a1a2e',
        theme_color: '#1a1a2e',
        lang: 'en',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: '/icons/icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
          {
            src: '/icons/icon-512-maskable.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpeg,jpg,svg,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
