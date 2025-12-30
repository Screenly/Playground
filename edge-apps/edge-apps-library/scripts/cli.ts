#!/usr/bin/env bun
/**
 * CLI command dispatcher for edge-apps-scripts
 */

import { execSync } from 'child_process'
import path from 'path'

const commands = {
  lint: {
    description: 'Run ESLint with shared configuration',
    handler: lintCommand,
  },
  format: {
    description: 'Format code with Prettier',
    handler: formatCommand,
  },
}

async function lintCommand(args: string[]) {
  try {
    // Get the caller's directory (the app that invoked this script)
    const callerDir = process.cwd()

    // Build eslint command
    const eslintArgs = [
      '--config',
      path.resolve(path.dirname(__dirname), 'eslint.config.ts'),
      '.',
      ...args,
    ]

    execSync(`eslint ${eslintArgs.map((arg) => `"${arg}"`).join(' ')}`, {
      stdio: 'inherit',
      cwd: callerDir,
    })
  } catch (error) {
    process.exit(1)
  }
}

async function formatCommand(args: string[]) {
  console.log('Format command coming soon!')
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
