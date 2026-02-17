#!/usr/bin/env bun
/**
 * CLI command dispatcher for edge-apps-scripts
 */

// PLEASE REMOVE ME AFTER TESTING.

import { execSync, spawn, type ChildProcess } from 'child_process'
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
  dev: {
    description: 'Start Vite development server',
    handler: devCommand,
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

/**
 * Helper: Get NODE_PATH with library's node_modules included
 */
function getNodePath(): string {
  const libraryNodeModules = path.resolve(libraryRoot, 'node_modules')
  const existingNodePath = process.env.NODE_PATH || ''
  return existingNodePath
    ? `${libraryNodeModules}${path.delimiter}${existingNodePath}`
    : libraryNodeModules
}

/**
 * Helper: Setup signal handlers for spawned processes
 */
function setupSignalHandlers(child: ChildProcess): void {
  const handleSignal = (signal: string) => {
    child.kill(signal as NodeJS.Signals)
    child.on('exit', () => process.exit(0))
  }
  process.on('SIGINT', () => handleSignal('SIGINT'))
  process.on('SIGTERM', () => handleSignal('SIGTERM'))
}

/**
 * Helper: Spawn a process with common options and signal handling
 */
function spawnWithSignalHandling(
  command: string,
  args: string[],
  errorMessage: string,
): void {
  const child = spawn(command, args, {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      NODE_PATH: getNodePath(),
    },
  })

  child.on('error', (err) => {
    console.error(errorMessage, err)
    process.exit(1)
  })

  setupSignalHandlers(child)
}

/**
 * Helper: Get Vite binary and config paths
 */
function getVitePaths(): { viteBin: string; configPath: string } {
  return {
    viteBin: path.resolve(libraryRoot, 'node_modules', '.bin', 'vite'),
    configPath: path.resolve(libraryRoot, 'vite.config.ts'),
  }
}

async function lintCommand(args: string[]) {
  try {
    const eslintBin = path.resolve(
      libraryRoot,
      'node_modules',
      '.bin',
      'eslint',
    )

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
        cwd: process.cwd(),
      },
    )
  } catch {
    process.exit(1)
  }
}

async function devCommand(args: string[]) {
  try {
    const { viteBin, configPath } = getVitePaths()
    const viteArgs = ['--config', configPath, ...args]

    spawnWithSignalHandling(viteBin, viteArgs, 'Failed to start dev server:')
  } catch {
    process.exit(1)
  }
}

async function buildCommand(args: string[]) {
  try {
    const { viteBin, configPath } = getVitePaths()
    const viteArgs = ['build', '--config', configPath, ...args]

    execSync(`"${viteBin}" ${viteArgs.map((arg) => `"${arg}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_PATH: getNodePath(),
      },
    })
  } catch {
    process.exit(1)
  }
}

async function buildDevCommand(args: string[]) {
  try {
    const { viteBin, configPath } = getVitePaths()
    const viteArgs = [
      'build',
      '--watch',
      '--sourcemap',
      '--config',
      configPath,
      ...args,
    ]

    spawnWithSignalHandling(viteBin, viteArgs, 'Failed to start build process:')
  } catch {
    process.exit(1)
  }
}

async function typeCheckCommand(args: string[]) {
  try {
    const tscBin = path.resolve(libraryRoot, 'node_modules', '.bin', 'tsc')

    const tscArgs = [
      '--noEmit',
      '--project',
      path.resolve(libraryRoot, 'tsconfig.json'),
      ...args,
    ]

    execSync(`"${tscBin}" ${tscArgs.map((arg) => `"${arg}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
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
