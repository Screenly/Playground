import { execSync } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = resolve(__dirname, '..', 'prettier.config.js')

const args = process.argv.slice(2)
const defaultPaths = ['src/', 'README.md', 'index.html', 'static/css/']

// Separate options (flags) from paths
const options = args.filter(arg => arg.startsWith('-'))
const paths = args.filter(arg => !arg.startsWith('-'))

// If no options provided, default to --write
const finalOptions = options.length === 0 ? ['--write'] : options
// If no paths provided, use defaults
const finalPaths = paths.length === 0 ? defaultPaths : paths

const command = `bun x prettier --config ${configPath} ${finalOptions.join(' ')} ${finalPaths.join(' ')}`

try {
  execSync(command, { stdio: 'inherit' })
} catch {
  process.exit(1)
}
