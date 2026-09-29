import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/justicia-cercana/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,json,png}'],
        navigateFallback: 'index.html'
      },
      manifest: {
        name: 'Justicia Cercana',
        short_name: 'Justicia',
        description: 'Registro de casos, tramites y agenda del juzgado de paz',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#f7f8fa',
        theme_color: '#1b4f9c',
        icons: [
          { src: 'icono.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      }
    })
  ],
  server: { port: 5173, strictPort: true }
})
