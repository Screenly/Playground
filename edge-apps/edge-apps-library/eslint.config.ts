import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  globalIgnores([
    'dist/',
    'node_modules/',
    'static/js/',
    'build/',
    'tailwind.config.js',
  ]),
  {
    rules: {
      'max-lines-per-function': ['error', {
        max: 70,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },
)
