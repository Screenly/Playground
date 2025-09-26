module.exports = [
  {
    ignores: [
      'node_modules/**',
      'static/js/*.min.js'
    ]
  },
  {
    files: ['**/*.js'],
    plugins: {
      prettier: require('eslint-plugin-prettier')
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        screenly: 'readonly',
        powerbi: 'readonly'
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off',
      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'prefer-const': 'warn'
    }
  }
]; 