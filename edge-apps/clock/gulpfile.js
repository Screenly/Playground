const { src, dest, series } = require('gulp')
const babel = require('gulp-babel')
const base64 = require('gulp-base64')
const del = require('del')
const inlineSource = require('gulp-inline-source')
const replace = require('gulp-replace')
const uglifyJS = require('gulp-uglify')
const uglifyCSS = require('gulp-uglifycss')
const removeCode = require('gulp-remove-code')

function buildJS () {
  return src('build/static/js/*.js')
    .pipe(babel())
    .pipe(uglifyJS())
    .pipe(dest('build/static/js'))
}

function buildCSS () {
  return src('build/static/styles/*.css')
    .pipe(uglifyCSS())
    .pipe(dest('build/static/styles'))
}

function cleanDist () {
  return del(['dist/**/*', '!dist'])
}

function cleanBuild () {
  return del('build')
}

function copyAssets () {
  return src(['src/**'])
    .pipe(dest('build'))
}

function replaceKeys () {
  return src(['build/index.html'])
    .pipe(removeCode({ sentry: !process.env.SENTRY_ID }))
    .pipe(removeCode({ googleAnalytics: !process.env.GA_API_KEY }))
    .pipe(replace('SENTRY_ID', process.env.SENTRY_ID))
    .pipe(replace('GA_API_KEY', process.env.GA_API_KEY))
    .pipe(dest('build'))
}

function inlineCSSAssets () {
  return src('./build/static/styles/*.css')
    .pipe(base64({
      maxImageSize: 2097152
    }))
    .pipe(dest('./build/static/styles'))
}

function inlineHTMLAssets () {
  return src('./build/**/*.html')
    .pipe(inlineSource({
      attribute: false
    }))
    .pipe(dest('./dist'))
}

exports.build = series(cleanDist, copyAssets, replaceKeys, buildJS, buildCSS, inlineCSSAssets, inlineHTMLAssets, cleanBuild)
