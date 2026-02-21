import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// Load environment variables
const PAPAYA_WEB_PORT = process.env.PAPAYA_WEB_PORT || '9476'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src/papaya')}/`
    }
  },
  // root: path.resolve('./src/web'),
  // build: {
  //   rollupOptions: {
  //     input: {
  //       app: './src/web/index.html',
  //     },
  //   },
  // },
  server: {
    port: parseInt(PAPAYA_WEB_PORT),
    host: '0.0.0.0', // Allow connections from outside the container
    allowedHosts: [
      'ax0ne.me',
      'localhost'
    ]
  }
})
