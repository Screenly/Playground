import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

/**
 * Plugin to copy screenly.yml and screenly_qc.yml into the build output directory.
 */
export function copyScreenlyManifestPlugin(): Plugin {
  return {
    name: 'copy-screenly-manifest',
    closeBundle() {
      const manifestSrc = path.resolve(process.cwd(), 'screenly.yml')
      const manifestDest = path.resolve(process.cwd(), 'dist', 'screenly.yml')

      const qcSrc = path.resolve(process.cwd(), 'screenly_qc.yml')
      const qcDest = path.resolve(process.cwd(), 'dist', 'screenly_qc.yml')

      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest)
      }

      if (fs.existsSync(qcSrc)) {
        fs.copyFileSync(qcSrc, qcDest)
      }
    },
  }
}
