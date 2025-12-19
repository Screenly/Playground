#!/usr/bin/env bun

import { execSync } from 'child_process'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const command = process.argv[2]

if (command === 'format') {
  const formatScript = resolve(__dirname, 'format.js')
  const args = process.argv.slice(3)

  try {
    execSync(`bun ${formatScript} ${args.join(' ')}`, { stdio: 'inherit' })
  } catch (error) {
    process.exit(1)
  }
} else if (command === '--help' || command === '-h' || !command) {
  console.log(`
edge-apps-scripts

Usage: edge-apps-scripts <command> [options]

Commands:
  format [paths...]   Format files with Prettier (default: src/ README.md index.html)
  --help, -h          Show this help message

Examples:
  edge-apps-scripts format              # Format default paths with --write
  edge-apps-scripts format --check      # Check formatting of default paths
  edge-apps-scripts format custom/      # Format custom path with --write
  edge-apps-scripts format custom/ --check   # Check formatting of custom path
`)
} else {
  console.error(`Unknown command: ${command}`)
  console.error(`Run 'edge-apps-scripts --help' for usage information`)
  process.exit(1)
}
