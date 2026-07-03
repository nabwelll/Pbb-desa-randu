import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Portal PBB Desa Randu',
        short_name: 'PBB Randu',
        description: 'Aplikasi Manajemen Pajak Bumi dan Bangunan Desa Randu',
        theme_color: '#002b8c',
        background_color: '#1a1d24',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo-kknt-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-kknt-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo-kknt-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // 🛠️ TAMBAHKAN INI: Supaya PWA aktif di mode development (npm run dev)
      devOptions: {
        enabled: true
      }
    })
  ]
})