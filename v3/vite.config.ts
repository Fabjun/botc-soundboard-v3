import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  define: {
    // Injected at build time — allows the UI to show the exact build date.
    // In dev mode, shows 'dev' so it's clear this is not a deployed build.
    __BUILD_DATE__: JSON.stringify(
      command === 'build' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : 'dev',
    ),
  },
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
}));
