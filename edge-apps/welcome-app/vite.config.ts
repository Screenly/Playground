import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { existsSync } from 'fs'

import { screenlyTestServer, watchMockDataPlugin } from '../blueprint/ts/vite-plugins'

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
    ...(mode === 'development'
      ? [watchMockDataPlugin() as unknown as Plugin]
      : []),
    screenlyTestServer(mode) as unknown as Plugin,
    viteStaticCopy({
      targets: [
        {
          src: manifestFileName,
          dest: '.',
        },
        ...(mode === 'development'
          ? [
              {
                src: 'mock-data.yml',
                dest: '.',
              },
            ]
          : []),
        ...(mode === 'development' && existsSync('instance.yml')
          ? [
              {
                src: 'instance.yml',
                dest: '.',
              },
            ]
          : []),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'blueprint/stores': fileURLToPath(
        new URL('../blueprint/ts/stores', import.meta.url),
      ),
      'blueprint/scss': fileURLToPath(
        new URL('../blueprint/scss', import.meta.url),
      ),
      'blueprint/components': fileURLToPath(
        new URL('../blueprint/ts/components', import.meta.url),
      ),
      'blueprint/assets': fileURLToPath(
        new URL('../blueprint/assets', import.meta.url),
      ),
    },
  },
}))
