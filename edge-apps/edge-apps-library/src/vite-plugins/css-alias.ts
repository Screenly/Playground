import type { Plugin } from 'vite'

/**
 * Plugin to resolve CSS imports with aliases.
 */
export function cssAliasPlugin(stylesPath: string): Plugin {
  return {
    name: 'css-alias-resolver',
    enforce: 'pre',
    resolveId(id, importer) {
      // Only handle CSS imports
      if (id === '@screenly/edge-apps/styles' && importer?.endsWith('.css')) {
        return stylesPath
      }
      return null
    },
  }
}
