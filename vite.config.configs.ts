import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/configs/index.ts'),
      name: 'ScreenlyStores',
      fileName: 'index',
      formats: ['es']
    },
    outDir: 'dist/configs',
    rollupOptions: {
      external: ['fs', 'node:process', '@playwright/test'],
      output: {
        globals: {
          fs: 'fs',
          'node:process': 'process',
          '@playwright/test': '@playwright/test'
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
