const { src, dest, series } = require('gulp');
const del = require('del');
const inlinesource = require('gulp-inline-source');

function cleanDist() {
  return del('dist')
}

function cleanBuild() {
  return del('build')
}

function copyAssets() {
  return src(['src/**'])
    .pipe(dest('build'))
}

function inlineAssets() {
  return src('./build/**/*.html')
    .pipe(inlinesource({
      attribute: false
    }))
    .pipe(dest('./dist'))
}

exports.build = series(cleanDist, copyAssets, inlineAssets, cleanBuild);
