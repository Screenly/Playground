import type { Plugin } from 'vite'

/**
 * Vite plugin that watches mock-data.yml during development builds
 * to trigger rebuilds when the file changes.
 */
export function watchMockDataPlugin(): Plugin {
  return {
    name: 'watch-mock-data',
    apply: 'build',
    buildStart() {
      // This registers mock-data.yml as a Rollup watched file
      this.addWatchFile('mock-data.yml')
    }
  }
}
