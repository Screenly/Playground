import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@screenly/edge-apps': path.resolve(__dirname, '../edge-apps-library/src/index.ts'),
    },
  },
  build: {
    outDir: 'static',
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

