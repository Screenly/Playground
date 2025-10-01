import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: './mock-data.yml',
          dest: ''
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'blueprint/stores': fileURLToPath(new URL('../blueprint/ts/stores', import.meta.url)),
      'blueprint/scss': fileURLToPath(new URL('../blueprint/scss', import.meta.url)),
      'blueprint/components': fileURLToPath(new URL('../blueprint/ts/components', import.meta.url)),
      'blueprint/assets': fileURLToPath(new URL('../blueprint/assets', import.meta.url))
    }
  },
  base: './'
})