var gulp = require('gulp');
var gutil = require('gulp-util');
var karma = require('gulp-karma');

gulp.task('default', function(){
  // place code for your default task here
});




var testFiles = [
	'lib/jquery/jquery.js',
	'lib/jquery.event.drag-drop/event.drag/jquery.event.drag.js',
	'test/libs/jasmine-jquery.js',
	'src/css/grid.css',
	'examples/bootstrap/bootstrap.min.css',
	'src/js-datagrid.js',
	'test/*spec.js'
];

gulp.task('test', function() {
  // Be sure to return the stream
  return gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));
});

gulp.task('default', function() {
  gulp.src(testFiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});