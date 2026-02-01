/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Admin Dashboard',
        short_name: 'Admin',
        description: 'White-Label Ecosystem Admin',
        theme_color: '#ffffff',
        /* 
           TODO: Generate regular PWA icons (pwa-192x192.png, pwa-512x512.png) 
           and place them in the 'public' directory to enable PWA installation.
        */
        icons: []
      }
    })
  ],
})
