import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const PREVIEW_PORT = 4173

// Resolve @playwright/test from the calling app's node_modules, not the library's
const appRequire = createRequire(path.join(process.cwd(), 'package.json'))
const { defineConfig, devices } = appRequire('@playwright/test')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const libraryRoot = path.dirname(__dirname)
const viteBin = path.resolve(libraryRoot, 'node_modules', '.bin', 'vite')
const viteConfig = path.resolve(libraryRoot, 'vite.config.ts')

export default defineConfig({
  testDir: path.join(process.cwd(), 'e2e'),
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    // Invoke vite directly so it always runs from the library's node_modules,
    // ensuring packages like tailwindcss resolve correctly regardless of the app.
    command: `"${viteBin}" build --config "${viteConfig}" && "${viteBin}" preview --config "${viteConfig}" --port ${PREVIEW_PORT} --strictPort`,
    cwd: process.cwd(),
    port: PREVIEW_PORT,
    reuseExistingServer: false,
  },
})
