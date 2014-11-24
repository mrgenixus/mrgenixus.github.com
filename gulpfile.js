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
  gulp.src('cv-2014/main.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./cv-2014'));

  gulp.src('main.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./cv-2014'));
});

gulp.task('watch', function () {
  gulp.watch(['*'], ['html']);
  gulp.watch(['cv-2014/main.styl'], ['stylus']);
});

gulp.task('default', ['connect', 'stylus', 'watch']);
