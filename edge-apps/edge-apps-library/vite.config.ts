import { defineConfig, Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { screenlyDevServer } from './vite-plugins/dev-server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function copyScreenlyFiles(): Plugin {
  return {
    name: 'copy-screenly-files',
    closeBundle() {
      const filesToCopy = ['screenly.yml', 'screenly_qc.yml', 'instance.yml']

      for (const file of filesToCopy) {
        const srcPath = resolve(process.cwd(), file)
        if (existsSync(srcPath)) {
          const destPath = resolve(process.cwd(), 'dist', file)
          try {
            copyFileSync(srcPath, destPath)
            console.log(`Copied ${file} to dist/`)
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Unknown error'
            throw new Error(
              `Failed to copy "${file}" to dist/: ${message}`,
              { cause: error },
            )
          }
        }
      }
    },
  }
}

export default defineConfig({
  base: '',
  server: {
    fs: {
      // Allow serving files from both the app directory and the library directory
      allow: [
        process.cwd(), // The edge app directory (e.g., edge-apps/clock)
        resolve(__dirname), // The edge-apps-library directory
      ],
    },
  },
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
