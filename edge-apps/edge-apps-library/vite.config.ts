import { defineConfig, Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { screenlyDevServer } from './vite-plugins/dev-server'

function copyScreenlyFiles(): Plugin {
  return {
    name: 'copy-screenly-files',
    closeBundle() {
      const filesToCopy = ['screenly.yml', 'screenly_qc.yml', 'instance.yml']

      for (const file of filesToCopy) {
        const srcPath = resolve(process.cwd(), file)
        if (existsSync(srcPath)) {
          const destPath = resolve(process.cwd(), 'dist', file)
          copyFileSync(srcPath, destPath)
          console.log(`Copied ${file} to dist/`)
        }
      }
    },
  }
}

export default defineConfig({
  base: '',
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 7000000,
    minify: true,
    rollupOptions: {
      input: 'index.html',
      output: {
        dir: 'dist',
        entryFileNames: 'js/[name].js',
        format: 'iife',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'css/style.css'
          }

          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  plugins: [tailwindcss(), screenlyDevServer(), copyScreenlyFiles()],
})
