import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'utils/index': resolve(__dirname, 'src/utils/index.ts'),
        'types/index': resolve(__dirname, 'src/types/index.ts'),
        'vue/index': resolve(__dirname, 'src/vue/index.ts'),
        'vue/components/index': resolve(__dirname, 'src/vue/components/index.ts'),
        'vue/stores/index': resolve(__dirname, 'src/vue/stores/index.ts'),
        'vue/utils/index': resolve(__dirname, 'src/vue/utils/index.ts'),
        'vue/constants/index': resolve(__dirname, 'src/vue/constants/index.ts'),
      },
      formats: ['es'],
    },
    outDir: 'dist',
    rollupOptions: {
      external: (id) => {
        // Mark all dependencies as external to prevent bundling
        return !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/');
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'vue/styles/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    sourcemap: false,
    emptyOutDir: false,
    minify: false,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
