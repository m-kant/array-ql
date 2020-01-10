
const gulp      = require('gulp');
const uglify    = require('gulp-uglify');
const uglifyEs  = require('gulp-uglify-es').default;
const rename    = require('gulp-rename');
const concat    = require('gulp-concat');
const del		    = require('del');
const babel     = require('gulp-babel');

gulp.task('clean', function(){ return del(['dist/*']); });

gulp.task("build", () =>
  gulp
    .src(["src/array-ql.js"])
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(gulp.dest("dist"))
    .pipe(rename("array-ql.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist"))
);

gulp.task('build-es6', () =>
    gulp.src(['src/array-ql.js', 'src/footer.es6.js'])
    .pipe(concat('random.es6.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('random.es6.min.js'))
    .pipe(uglifyEs())
    .pipe(gulp.dest('dist'))
);

gulp.task('clean_build', gulp.series( 'clean', gulp.parallel(['build'])));
gulp.task('default', gulp.series('build') );
