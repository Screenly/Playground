#!/usr/bin/env bun
/**
 * Copy assets from src to dist after TypeScript compilation
 */

import { cpSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const libraryRoot = dirname(__dirname)

const srcAssets = `${libraryRoot}/src/assets`
const distAssets = `${libraryRoot}/dist/assets`

if (existsSync(srcAssets)) {
  // Ensure dist directory exists
  mkdirSync(dirname(distAssets), { recursive: true })

  // Copy assets
  cpSync(srcAssets, distAssets, { recursive: true })
  console.log('✓ Copied assets to dist/')
} else {
  console.warn('⚠ No assets directory found in src/')
}
