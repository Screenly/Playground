import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/vite-plugins/index.ts'),
      name: 'ScreenlyVitePlugins',
      fileName: 'vite-plugins',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vite', 'fs'],
      output: {
        globals: {
          vite: 'vite',
          fs: 'fs'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
