module.exports = {
  rules: {
    'media-feature-range-notation': 'context'
  },
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
    }
  ]
}
