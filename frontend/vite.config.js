import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',   // To allow connections from any device on the network
    port: 5173,
    headers:{
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    }
  },
  proxy: {
     '/cdn': {
        target: 'https://cdn.jsdelivr.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, '')
     }
  }
})
