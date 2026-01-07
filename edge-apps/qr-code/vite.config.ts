import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    outDir: 'static',
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        dir: 'static/js',
        entryFileNames: '[name].js',
      },
    },
  },
})
