import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png',
        'apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-512-maskable.png',
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
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webmanifest}'],
        navigateFallback: 'index.html',
        // Don't intercept API or backend routes with the fallback
        navigateFallbackDenylist: [/^\/api\//, /^\/feed/, /^\/content/, /^\/podcasts/, /^\/clips/, /^\/topics/, /^\/auth/, /^\/capture/, /^\/admin/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
