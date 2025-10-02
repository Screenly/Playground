module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'static/js/vendor/**',
    '**/vendor/**',
    '**/*.min.js',
    'panic-overlay.min.js',
    'powerbi.min.js',
  ],
  rules: {
    // Add any specific rules here if needed
  },
}
