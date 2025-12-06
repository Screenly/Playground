import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const manifestFileName = process.env.MANIFEST_FILE_NAME || 'screenly.yml'

export default defineConfig(({ mode }) => ({
  base: '',
  build: {
    sourcemap: mode === 'development',
  },
  publicDir: false,
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: manifestFileName,
          dest: '.'
        },
        {
          src: 'static/*',
          dest: 'static'
        }
      ]
    })
  ]
}))
