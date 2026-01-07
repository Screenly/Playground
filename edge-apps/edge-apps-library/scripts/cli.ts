#!/usr/bin/env bun
/**
 * CLI command dispatcher for edge-apps-scripts
 */

import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const libraryRoot = path.dirname(__dirname)

const commands = {
  lint: {
    description: 'Run ESLint with shared configuration',
    handler: lintCommand,
  },
  build: {
    description: 'Build application for production',
    handler: buildCommand,
  },
  'build:dev': {
    description: 'Build application in development mode with watch',
    handler: buildDevCommand,
  },
}

async function lintCommand(args: string[]) {
  try {
    // Get the caller's directory (the app that invoked this script)
    const callerDir = process.cwd()
    
    // Get path to eslint binary in the library's node_modules
    const eslintBin = path.resolve(libraryRoot, 'node_modules', '.bin', 'eslint')

    // Build eslint command
    const eslintArgs = [
      '--config',
      path.resolve(libraryRoot, 'eslint.config.ts'),
      '.',
      ...args,
    ]

    execSync(`"${eslintBin}" ${eslintArgs.map((arg) => `"${arg}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: callerDir,
    })
  } catch {
    process.exit(1)
  }
}

async function buildCommand(args: string[]) {
  try {
    const callerDir = process.cwd()
    
    // Build for production (no watch)
    const bunArgs = [
      'build',
      'src/main.ts',
      '--outdir',
      'static/js',
      '--target',
      'browser',
      ...args,
    ]

    execSync(`bun ${bunArgs.map((arg) => `"${arg}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: callerDir,
    })
  } catch {
    process.exit(1)
  }
}

async function buildDevCommand(args: string[]) {
  try {
    const callerDir = process.cwd()
    
    // Build for development with watch mode
    const bunArgs = [
      'build',
      'src/main.ts',
      '--outdir',
      'static/js',
      '--target',
      'browser',
      '--watch',
      ...args,
    ]

    execSync(`bun ${bunArgs.map((arg) => `"${arg}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: callerDir,
    })
  } catch {
    process.exit(1)
  }
}

export async function run() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    printHelp()
    process.exit(1)
  }

  const cmd = args[0]
  const cmdArgs = args.slice(1)

  if (cmd === '--help' || cmd === '-h') {
    printHelp()
    process.exit(0)
  }

  if (!(cmd in commands)) {
    console.error(`Unknown command: ${cmd}`)
    printHelp()
    process.exit(1)
  }

  const handler = commands[cmd as keyof typeof commands].handler
  await handler(cmdArgs)
}

function printHelp() {
  console.log(`
edge-apps-scripts - Shared tooling for Screenly Edge Apps

Usage: edge-apps-scripts <command> [options]

Commands:
${Object.entries(commands)
  .map(([name, { description }]) => `  ${name.padEnd(12)} ${description}`)
  .join('\n')}

Options:
  --help, -h   Show this help message
`)
}
