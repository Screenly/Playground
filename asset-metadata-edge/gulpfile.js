const { src, dest, series } = require('gulp')
const del = require('del')
const inlineSource = require('gulp-inline-source')
const base64 = require('gulp-base64')
const replace = require('gulp-replace')

function cleanDist () {
  return del(['dist/**/*', '!dist'])
}

function cleanBuild () {
  return del('build')
}

function replaceKey () {
  return src(['build/assets/scripts/load-metadata.js'])
    .pipe(replace('GOOGLE_MAPS_API_KEY', process.env.GOOGLE_MAPS_API_KEY))
    .pipe(dest('build/assets/scripts'))
}

function copyAssets () {
  return src(['src/**'])
    .pipe(dest('build'))
}

function inlineCSSAssets () {
  return src('./build/assets/styles/*.css')
    .pipe(base64())
    .pipe(dest('./build/assets/styles'))
}

function inlineHTMLAssets () {
  return src('./build/**/*.html')
    .pipe(inlineSource({
      attribute: false
    }))
    .pipe(dest('./dist'))
}

exports.build = series(cleanDist, copyAssets, replaceKey, inlineCSSAssets, inlineHTMLAssets, cleanBuild)
