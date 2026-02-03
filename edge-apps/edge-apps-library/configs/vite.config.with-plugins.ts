import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import {
  screenlyMockPlugin,
  copyScreenlyManifestPlugin,
  componentResolvePlugin,
  cssAliasPlugin,
} from '../src/vite-plugins/index.js'

const libraryRoot = path.resolve(__dirname, '..')
const stylesPath = path.resolve(libraryRoot, 'src/styles/index.css')

export default defineConfig({
  base: '',
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@screenly/edge-apps/vite-plugins': path.resolve(libraryRoot, 'src/vite-plugins/index.ts'),
      '@screenly/edge-apps/components': path.resolve(libraryRoot, 'src/components/index.ts'),
      '@screenly/edge-apps': path.resolve(libraryRoot, 'src/index.ts'),
      '@screenly/edge-apps/styles': stylesPath,
    },
  },
  plugins: [
    componentResolvePlugin(libraryRoot),
    cssAliasPlugin(stylesPath),
    copyScreenlyManifestPlugin(),
    screenlyMockPlugin(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name][extname]'
          }
          return '[name][extname]'
        },
      },
    },
  },
})
