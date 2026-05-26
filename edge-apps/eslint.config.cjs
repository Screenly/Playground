/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        screenly: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        alert: 'readonly',
        location: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
    },
  },
]
