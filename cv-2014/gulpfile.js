var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    connect = require('gulp-connect');

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('*').pipe(connect.reload());
});

gulp.task('stylus', function () {
  gulp.src('main.styl')
    .pipe(stylus())
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
});

gulp.task('default', ['connect', 'stylus', 'watch']);
