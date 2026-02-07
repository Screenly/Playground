#!/usr/bin/env bun
/**
 * CLI command dispatcher for edge-apps-scripts
 */

import { execSync, spawn } from 'child_process'
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
  'type-check': {
    description: 'Run TypeScript type checking',
    handler: typeCheckCommand,
  },
}

async function lintCommand(args: string[]) {
  try {
    // Get the caller's directory (the app that invoked this script)
    const callerDir = process.cwd()

    // Get path to eslint binary in the library's node_modules
    const eslintBin = path.resolve(
      libraryRoot,
      'node_modules',
      '.bin',
      'eslint',
    )

    // Build eslint command
    const eslintArgs = [
      '--config',
      path.resolve(libraryRoot, 'eslint.config.ts'),
      '.',
      ...args,
    ]

    execSync(
      `"${eslintBin}" ${eslintArgs.map((arg) => `"${arg}"`).join(' ')}`,
      {
        stdio: 'inherit',
        cwd: callerDir,
      },
    )
  } catch {
    process.exit(1)
  }
}

async function buildCommand(args: string[]) {
  try {
    const callerDir = process.cwd()

    // Build for production using Vite
    const viteBin = path.resolve(libraryRoot, 'node_modules', '.bin', 'vite')
    const configPath = path.resolve(libraryRoot, 'vite.config.ts')
    const viteArgs = ['build', '--config', configPath, ...args]

    // Set NODE_PATH to include library's node_modules so plugins can resolve dependencies
    const libraryNodeModules = path.resolve(libraryRoot, 'node_modules')
    const existingNodePath = process.env.NODE_PATH || ''
    const nodePath = existingNodePath
      ? `${libraryNodeModules}${path.delimiter}${existingNodePath}`
      : libraryNodeModules

    execSync(`"${viteBin}" ${viteArgs.map((arg) => `"${arg}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: callerDir,
      env: {
        ...process.env,
        NODE_PATH: nodePath,
      },
    })
  } catch {
    process.exit(1)
  }
}

async function buildDevCommand(args: string[]) {
  try {
    const callerDir = process.cwd()

    // Build for development with watch mode using Vite
    const viteBin = path.resolve(libraryRoot, 'node_modules', '.bin', 'vite')
    const configPath = path.resolve(libraryRoot, 'vite.config.ts')
    const viteArgs = [
      'build',
      '--watch',
      '--sourcemap',
      '--config',
      configPath,
      ...args,
    ]

    // Set NODE_PATH to include library's node_modules so plugins can resolve dependencies
    const libraryNodeModules = path.resolve(libraryRoot, 'node_modules')
    const existingNodePath = process.env.NODE_PATH || ''
    const nodePath = existingNodePath
      ? `${libraryNodeModules}${path.delimiter}${existingNodePath}`
      : libraryNodeModules

    // Use spawn instead of execSync to allow watch mode to run without blocking
    const child = spawn(viteBin, viteArgs, {
      stdio: 'inherit',
      cwd: callerDir,
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        NODE_PATH: nodePath,
      },
    })

    // Attach an error handler
    child.on('error', (err) => {
      console.error('Failed to start build process:', err)
      process.exit(1)
    })

    // Handle parent process termination to clean up child process
    const handleSignal = (signal: string) => {
      child.kill(signal as NodeJS.Signals)
      child.on('exit', () => process.exit(0))
    }
    process.on('SIGINT', () => handleSignal('SIGINT'))
    process.on('SIGTERM', () => handleSignal('SIGTERM'))
  } catch {
    process.exit(1)
  }
}

async function typeCheckCommand(args: string[]) {
  try {
    const callerDir = process.cwd()

    // Get path to tsc binary in the library's node_modules
    const tscBin = path.resolve(libraryRoot, 'node_modules', '.bin', 'tsc')

    // Build tsc command
    const tscArgs = [
      '--noEmit',
      '--project',
      path.resolve(libraryRoot, 'tsconfig.json'),
      ...args,
    ]

    execSync(`"${tscBin}" ${tscArgs.map((arg) => `"${arg}"`).join(' ')}`, {
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
