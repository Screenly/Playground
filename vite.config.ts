import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/vite-plugins/index.ts'),
      name: 'ScreenlyVitePlugins',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vite', 'yaml', 'fs'],
      output: {
        globals: {
          vite: 'vite',
          yaml: 'YAML',
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
