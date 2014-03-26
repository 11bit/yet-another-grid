'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var karma = require('gulp-karma');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var csso = require('gulp-csso');

var paths = {
  source: [
    'src/*.js'
  ],
  css: [
    'src/css/*.css'
  ],
  tests: [
    'test/*spec.js'
  ],
  testLibs: [
    'lib/jquery/jquery.js',
    'lib/jquery.event.drag-drop/event.drag/jquery.event.drag.js',
    'test/libs/jasmine-jquery.js',
    'examples/bootstrap/bootstrap.min.css'
  ]
};

var testFiles = paths.testLibs
  .concat(paths.css)
  .concat(paths.source)
  .concat(paths.tests);

gulp.task('test', function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('js', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  return gulp.src(paths.source)
    .pipe(concat('yet-another-grid.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('yet-another-grid.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
  return gulp.src(paths.css)
    .pipe(csso())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('build', ['js', 'css']);

gulp.task('default', function() {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});

