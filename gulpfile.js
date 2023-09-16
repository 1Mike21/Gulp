const gulp = require('gulp');
const del = require('del');
const browsersync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const newer = require('gulp-newer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const scss = require('gulp-sass')(require('sass'));

//* Константа с путями
const paths = {
  html: {
    src: 'src/*.html',
    dest: 'dist'
  },
  styles: {
    src: ['src/styles/**/*.sass', 'src/styles/**/*.scss'],
    dest: 'dist/css/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'dist/js'
  },
  images: {
    src: 'src/images/**',
    dest: 'dist/images'
  } 
}

//* Функция очистки
function clean() {
  return del(['dist/*', '!dist/images'])
}

function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browsersync.stream());
}

//* Задача для обработки стилей
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(scss().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename({
      basename: 'app',
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browsersync.stream());
}

//* Задача для обработки скриптов 
function scripts() {
  return gulp.src(paths.scripts.src)
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(uglify())
  .pipe(concat('app.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browsersync.stream());
}

//* Задача для работы с картинками
function images () {
  return gulp.src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(webp({
      quality: 50
    }))
    .pipe(newer(paths.images.dest))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(paths.images.dest));
} 

//* Задача отслеживания изменений
function watch() {
  browsersync.init({
    server: {
      baseDir: './dist/'
    }
  })
  gulp.watch(paths.html.dest).on('change', browsersync.reload )
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, images)
}

//* Финальная сборка 
const build = gulp.series(clean, html, gulp.parallel(styles, scripts, images), watch)

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.html = html;
exports.watch = watch;
exports.build = build;
exports.default = build;