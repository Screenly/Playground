const { src, dest, series, watch } = require('gulp');
const njk = require('gulp-nunjucks-render');
const beautify = require('gulp-beautify');
const del = require('del');
const gulpCopy = require('gulp-copy');

function clean() {
  return del(['dist', 'build'])
}

function copyTemplateAssets() {
  return src(['src/templates/assets/**'])
    .pipe(dest('build/assets'))
}

function copyAppAssets() {
  return src(['src/apps/**/assets/**'])
    .pipe(dest('build'))
}

function html() {
  return src('src/apps/**/pages/*.+(html|njk)')
    .pipe(
      njk({
        path: ['src/templates']
      })
    )
    .pipe(beautify.html({ indent_size: 4, preserve_newlines: false }))
    .pipe(dest('build'))
}

function watchFiles() {
  watch('src/**/*', html)
}
const copy = series(copyTemplateAssets, copyAppAssets);
exports.build = series(clean, html)
exports.default = series(clean, copy, html, watchFiles)