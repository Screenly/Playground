#!/usr/bin/env bun
/**
 * CLI command dispatcher for edge-apps-scripts
 */

import { execSync, spawn, type ChildProcess } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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
  screenshots: {
    description: 'Capture screenshots at all supported resolutions',
    handler: screenshotsCommand,
  },
  create: {
    description: 'Initialize a scaffolded Edge App (replaces template placeholders)',
    handler: createCommand,
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

async function convertPngsToWebP(screenshotsDir: string): Promise<void> {
  const pngFiles = fs
    .readdirSync(screenshotsDir)
    .filter((f) => f.endsWith('.png'))

  for (const file of pngFiles) {
    const pngPath = path.join(screenshotsDir, file)
    const webpPath = path.join(screenshotsDir, file.replace('.png', '.webp'))
    await sharp(pngPath).webp().toFile(webpPath)
    fs.unlinkSync(pngPath)
  }
}

async function screenshotsCommand(_args: string[]) {
  try {
    const playwrightBin = path.resolve(
      process.cwd(),
      'node_modules',
      '.bin',
      'playwright',
    )
    const playwrightConfig = path.resolve(
      libraryRoot,
      'configs',
      'playwright.ts',
    )
    execSync(`"${playwrightBin}" test --config "${playwrightConfig}"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_PATH: getNodePath(),
      },
    })

    const screenshotsDir = path.resolve(process.cwd(), 'screenshots')
    if (fs.existsSync(screenshotsDir)) {
      await convertPngsToWebP(screenshotsDir)
    }
  } catch (error) {
    console.error(
      'Failed to run screenshot tests. Ensure `@playwright/test` is installed and the Playwright config file exists.',
    )
    if (error instanceof Error && error.message) {
      console.error(error.message)
    }
    process.exit(1)
  }
}

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.html',
  '.css',
  '.scss',
  '.json',
  '.yml',
  '.yaml',
  '.md',
  '.txt',
  '.svg',
  '.gitignore',
  '.ignore',
])

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git'])

function toTitleCase(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function walkTextFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) results.push(...walkTextFiles(fullPath))
    } else if (
      entry.isFile() &&
      (TEXT_EXTENSIONS.has(path.extname(entry.name)) ||
        TEXT_EXTENSIONS.has(entry.name))
    ) {
      results.push(fullPath)
    }
  }
  return results
}

function replaceInFile(
  filePath: string,
  replacements: Record<string, string>,
): void {
  const original = fs.readFileSync(filePath, 'utf-8')
  const updated = Object.entries(replacements).reduce(
    (src, [placeholder, value]) => src.replaceAll(placeholder, value),
    original,
  )
  if (updated !== original) fs.writeFileSync(filePath, updated, 'utf-8')
}

async function createCommand(_args: string[]) {
  const projectRoot = process.cwd()
  const pkgPath = path.join(projectRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const appName: string = pkg.name ?? 'my-edge-app'
  const appTitle = toTitleCase(appName)
  const appDescription = `${appTitle} - Screenly Edge App`

  const replacements: Record<string, string> = {
    '{{APP_NAME}}': appName,
    '{{APP_TITLE}}': appTitle,
    '{{APP_DESCRIPTION}}': appDescription,
  }

  console.log(`\nInitializing Edge App: ${appTitle}`)

  for (const filePath of walkTextFiles(projectRoot)) {
    replaceInFile(filePath, replacements)
  }

  const updatedPkg = { ...pkg }
  delete updatedPkg['bun-create']
  fs.writeFileSync(pkgPath, JSON.stringify(updatedPkg, null, 2) + '\n', 'utf-8')

  console.log(`
Done! Your Edge App is ready.

Next steps:
  1. Add an id field to screenly.yml and screenly_qc.yml.

  2. Install dependencies:
       bun install

  3. Start the dev server:
       bun run dev

  4. Deploy when ready:
       bun run deploy
`)
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
