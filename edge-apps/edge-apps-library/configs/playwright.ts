import path from 'path'
import { createRequire } from 'module'

const PREVIEW_PORT = 4173

// Resolve @playwright/test from the calling app's node_modules, not the library's
const appRequire = createRequire(path.join(process.cwd(), 'package.json'))
const { defineConfig, devices } = appRequire('@playwright/test')

export default defineConfig({
  testDir: path.join(process.cwd(), 'e2e'),
  use: {
    baseURL: `http://localhost:${PREVIEW_PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'bun run build && bun run screenshots:preview',
    cwd: process.cwd(),
    port: PREVIEW_PORT,
    reuseExistingServer: false,
  },
})
