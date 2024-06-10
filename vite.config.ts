import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/su7/',
  build: {
    outDir: 'docs'
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {}
})
