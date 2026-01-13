import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '',
  build: {
    rollupOptions: {
      input: 'src/main.ts',
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
  plugins: [tailwindcss()],
})
