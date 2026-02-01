import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { existsSync } from 'fs'

const manifestFileName = process.env.MANIFEST_FILE_NAME || 'screenly.yml'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: '',
  build: {
    sourcemap: mode === 'development',
  },
  plugins: [
    vue(),
    vueDevTools(),
    viteStaticCopy({
      targets: [
        {
          src: manifestFileName,
          dest: '.'
        },
        ...(mode === 'development' ? [{
          src: 'mock-data.yml',
          dest: '.'
        }] : []),
        ...(mode === 'development' && existsSync('instance.yml') ? [{
          src: 'instance.yml',
          dest: '.'
        }] : [])
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
