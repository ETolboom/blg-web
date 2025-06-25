import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  assetsInclude: ['**/*.bpmn'],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/submissions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/rubric': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/algorithms': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
