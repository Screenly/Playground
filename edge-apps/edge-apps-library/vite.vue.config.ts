import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { existsSync } from 'fs'
import path from 'path'
import { watchMockDataPlugin } from './scripts/vite-plugins/watch-mock-data'
import { screenlyTestServer } from './scripts/vite-plugins/test-server'

const manifestFileName = process.env.MANIFEST_FILE_NAME || 'screenly.yml'

/**
 * Central Vite configuration for Vue-based Edge Apps
 * This config is used by edge-apps-scripts when building Vue applications
 */
export default defineConfig(({ mode }) => {
  // Get the calling app's directory
  const appDir = process.cwd()

  return {
    base: '',
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          dir: 'dist',
          entryFileNames: 'js/[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.[0]?.endsWith('.css')) {
              return 'css/style.css'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
    plugins: [
      vue(),
      vueDevTools(),
      screenlyTestServer(mode) as unknown as Plugin,
      ...(mode === 'development' ? [watchMockDataPlugin() as unknown as Plugin] : []),
      viteStaticCopy({
        targets: [
          {
            src: manifestFileName,
            dest: '.',
          },
          ...(mode === 'development' && existsSync(path.join(appDir, 'mock-data.yml'))
            ? [
                {
                  src: 'mock-data.yml',
                  dest: '.',
                },
              ]
            : []),
          ...(mode === 'development' && existsSync(path.join(appDir, 'instance.yml'))
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
        '@': fileURLToPath(new URL('./src', `file://${appDir}/`)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  }
})
