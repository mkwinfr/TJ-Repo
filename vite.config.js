import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Balloon Pop: Sky Kingdom',
        short_name: 'BalloonPop',
        description: 'Pop balloons, build combos, and save the Sky Kingdom! 7 worlds, 105 levels.',
        theme_color: '#3a1a6b',
        background_color: '#1a0b3d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache all app assets for offline play
        globPatterns: ['**/*.{js,css,html,svg,woff2,woff,ttf}'],
      },
    }),
  ],
})
