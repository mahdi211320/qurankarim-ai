import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// دستیار آموزشی قرآن متوسطه اول
// پیکربندی Vite همراه با پلاگین PWA برای نصب و کارکرد آفلاین
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'دستیار آموزشی قرآن متوسطه اول',
        short_name: 'قرآن‌یار',
        description:
          'دستیار آموزشی قرآن برای دانش‌آموزان پایه هفتم، هشتم و نهم متوسطه اول',
        theme_color: '#0B6E4F',
        background_color: '#FAF8F3',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
})
