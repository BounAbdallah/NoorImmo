import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Noor Immo',
        short_name: 'Noor Immo',
        description: 'Gestion immobilière simplifiée',
        theme_color: '#0284c7',
        background_color: '#050505',
        display: 'standalone',
        start_url: '/login',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Force le service worker à s'activer immédiatement sans attendre
        // que tous les onglets soient fermés → les utilisateurs PWA reçoivent
        // les corrections de bugs au prochain chargement de page
        skipWaiting: true,
        clientsClaim: true,
        // Ne pas mettre en cache les appels API
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/immo-back\.noorwebservices\.com\/api\//,
            handler: 'NetworkOnly',
          },
        ],
      }
    })
  ],
})
