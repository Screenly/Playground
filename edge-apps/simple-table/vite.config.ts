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
      '@': '/src'
    }
  },
  base: './'
})