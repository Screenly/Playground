import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

/**
 * Plugin to resolve .js imports to .ts files in edge-apps-library.
 * This is needed because TypeScript uses .js extensions in imports but actual files are .ts
 */
export function componentResolvePlugin(libraryRoot: string): Plugin {
  return {
    name: 'component-resolve',
    enforce: 'pre',
    resolveId(id, importer) {
      // Handle exact match for @screenly/edge-apps/components
      if (id === '@screenly/edge-apps/components') {
        return path.resolve(libraryRoot, 'src/components/index.ts')
      }
      // Handle sub-path imports like @screenly/edge-apps/components/app-header/app-header
      if (id.startsWith('@screenly/edge-apps/components/')) {
        const subPath = id.replace('@screenly/edge-apps/components/', '')
        // Try with .ts extension
        const tsPath = path.resolve(libraryRoot, 'src/components', `${subPath}.ts`)
        if (fs.existsSync(tsPath)) {
          return tsPath
        }
        // Try without extension (for imports that specify .js)
        const jsPath = path.resolve(
          libraryRoot,
          'src/components',
          `${subPath.replace(/\.js$/, '')}.ts`,
        )
        if (fs.existsSync(jsPath)) {
          return jsPath
        }
      }

      // Handle .js imports from edge-apps-library (resolve to .ts)
      if (importer && id.endsWith('.js') && !id.startsWith('http')) {
        // Skip node_modules
        if (id.includes('node_modules') || id.startsWith('@')) {
          return null
        }

        // Check if importer is from edge-apps-library
        if (importer.includes('/edge-apps-library/')) {
          const tsPath = id.replace(/\.js$/, '.ts')
          const importerDir = path.dirname(importer)
          const fullPath = path.resolve(importerDir, tsPath)
          if (fs.existsSync(fullPath)) {
            return fullPath
          }
          // Also try with .tsx extension
          const tsxPath = id.replace(/\.js$/, '.tsx')
          const fullTsxPath = path.resolve(importerDir, tsxPath)
          if (fs.existsSync(fullTsxPath)) {
            return fullTsxPath
          }
        }
      }
      return null
    },
  }
}
