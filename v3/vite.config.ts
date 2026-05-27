import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/botc-soundboard-v3/',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'Soundboard of Storytelling',
        short_name: 'SoS',
        description: 'A soundboard for tabletop storytelling',
        start_url: '/botc-soundboard-v3/',
        scope: '/botc-soundboard-v3/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0a0a14',
        theme_color: '#0a0a14',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
