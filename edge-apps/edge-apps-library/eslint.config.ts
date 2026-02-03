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
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'max-lines-per-function': ['error', {
        max: 70,
        skipBlankLines: true,
        skipComments: true,
      }],
      'max-lines': ['error', {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      }],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'max-lines': 'off',
    },
  },
)
