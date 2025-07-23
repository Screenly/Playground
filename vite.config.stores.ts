import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/stores/index.ts'),
      name: 'ScreenlyStores',
      fileName: 'index',
      formats: ['es']
    },
    outDir: 'dist/stores'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
