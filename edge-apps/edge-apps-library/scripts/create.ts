/**
 * Edge App Generator
 * Creates a new Edge App from the template
 */

import fs from 'fs'
import path from 'path'
import readline from 'readline'

function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function copyDirectory(
  src: string,
  dest: string,
  replacements: Record<string, string>,
): void {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, replacements)
    } else {
      // Check if file is binary (images, fonts, etc.)
      const binaryExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.svg',
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
        '.ico',
        '.webp',
      ]
      const isBinary = binaryExtensions.some((ext) =>
        entry.name.toLowerCase().endsWith(ext),
      )

      if (isBinary) {
        // Copy binary files directly without text processing
        fs.copyFileSync(srcPath, destPath)
      } else {
        // Process text files with replacements
        let content = fs.readFileSync(srcPath, 'utf8')

        // Replace placeholders
        for (const [key, value] of Object.entries(replacements)) {
          content = content.replaceAll(key, value)
        }

        fs.writeFileSync(destPath, content)
      }
    }
  }
}

interface AppConfig {
  sanitizedName: string
  appTitle: string
  description: string
  enableAutoScaler: boolean
  enableDevTools: boolean
}

async function getUserInput(rl: readline.Interface): Promise<AppConfig> {
  // Get app name (retry until valid)
  let appName = ''
  while (!appName || appName.trim() === '') {
    appName = await question(rl, 'App name (e.g., my-dashboard): ')
    if (!appName || appName.trim() === '') {
      console.log('❌ App name is required. Please try again.\n')
    }
  }

  const sanitizedName = sanitizeName(appName)
  const appTitle = toTitleCase(sanitizedName)

  // Get description
  const description =
    (await question(rl, `Description [${appTitle} Edge App]: `)) ||
    `${appTitle} Edge App`

  // Get auto-scaler option (default: true)
  const autoScalerAnswer = await question(rl, 'Enable auto-scaler? (Y/n): ')
  const enableAutoScaler = autoScalerAnswer.toLowerCase() !== 'n'

  // Get dev-tools option (default: false)
  const devToolsAnswer = await question(rl, 'Enable dev tools? (y/N): ')
  const enableDevTools = devToolsAnswer.toLowerCase() === 'y'

  return {
    sanitizedName,
    appTitle,
    description,
    enableAutoScaler,
    enableDevTools,
  }
}

async function validateTargetDirectory(
  rl: readline.Interface,
  targetDir: string,
  sanitizedName: string,
): Promise<void> {
  if (fs.existsSync(targetDir)) {
    const overwrite = await question(
      rl,
      `\n⚠️  Directory "${sanitizedName}" already exists. Overwrite? (y/N): `,
    )
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Cancelled')
      rl.close()
      process.exit(0)
    }
    fs.rmSync(targetDir, { recursive: true, force: true })
  }
}

function buildReplacements(config: AppConfig): Record<string, string> {
  const {
    sanitizedName,
    appTitle,
    description,
    enableAutoScaler,
    enableDevTools,
  } = config

  return {
    '{{APP_NAME}}': sanitizedName,
    '{{APP_ID}}': sanitizedName,
    '{{APP_TITLE}}': appTitle,
    '{{APP_DESCRIPTION}}': description,
    '{{AUTO_SCALER_START}}': enableAutoScaler
      ? '<auto-scaler reference-width="1920" reference-height="1080" orientation="auto">'
      : '',
    '{{AUTO_SCALER_END}}': enableAutoScaler ? '</auto-scaler>' : '',
    '{{DEV_TOOLS}}': enableDevTools
      ? '  <!-- Dev tools only show in development mode (localhost or with ?dev=true) -->\n  <edge-app-devtools reference-width="1920" reference-height="1080"></edge-app-devtools>'
      : '',
  }
}

function fixViteConfigPaths(targetDir: string, libraryRoot: string): void {
  const libraryPath = path.relative(targetDir, libraryRoot)
  const viteConfigPath = path.join(targetDir, 'vite.config.ts')

  if (fs.existsSync(viteConfigPath)) {
    let viteConfig = fs.readFileSync(viteConfigPath, 'utf8')

    viteConfig = viteConfig.replace(
      /path\.resolve\(__dirname, '\.\.\/src\//g,
      `path.resolve(__dirname, '${libraryPath}/src/`,
    )

    viteConfig = viteConfig.replace(
      /const libraryRoot = path\.resolve\(__dirname, '\.\.'\)/g,
      `const libraryRoot = path.resolve(__dirname, '${libraryPath}')`,
    )

    fs.writeFileSync(viteConfigPath, viteConfig)
  }
}

export async function createApp(): Promise<void> {
  const rl = createReadline()

  try {
    process.stdout.write('\n🚀 Create New Edge App\n\n')

    const config = await getUserInput(rl)
    const { sanitizedName, enableDevTools } = config

    // Paths relative to library root
    const libraryRoot = path.resolve(__dirname, '..')
    const templateDir = path.join(libraryRoot, 'template')
    const edgeAppsDir = path.resolve(libraryRoot, '..')
    const targetDir = path.join(edgeAppsDir, sanitizedName)

    await validateTargetDirectory(rl, targetDir, sanitizedName)

    // Check if template exists
    if (!fs.existsSync(templateDir)) {
      console.log(`\n❌ Template not found at: ${templateDir}`)
      console.log('   Please ensure the template directory exists.')
      rl.close()
      process.exit(1)
    }

    console.log(`\n📦 Creating ${sanitizedName}...`)

    // Build replacements with library paths
    const replacements = buildReplacements(config)
    const srcDir = path.join(targetDir, 'src')
    const libraryStylesPath = path
      .relative(srcDir, path.join(libraryRoot, 'src/styles/index.css'))
      .replace(/\\/g, '/')
    const libraryConfigPath = path
      .relative(
        targetDir,
        path.join(libraryRoot, 'configs/tailwind.config.base.js'),
      )
      .replace(/\\/g, '/')

    replacements['{{LIBRARY_STYLES_PATH}}'] = libraryStylesPath
    replacements['{{LIBRARY_CONFIG_PATH}}'] = libraryConfigPath

    copyDirectory(templateDir, targetDir, replacements)
    fixViteConfigPaths(targetDir, libraryRoot)

    console.log(`\n✅ Created ${sanitizedName}!\n`)
    console.log('📝 Next steps:\n')
    console.log(`   cd edge-apps/${sanitizedName}`)
    console.log('   bun install')
    console.log('   bun run dev\n')
    if (enableDevTools) {
      console.log('📖 Press "D" in the browser to toggle dev tools overlay\n')
    }
  } finally {
    rl.close()
  }
}
