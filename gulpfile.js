/* gulp dependencies */
var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
var imagemin = require('gulp-imagemin');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCSS = require('gulp-minify-css');
var lessDependents = require('gulp-less-dependents');
var clean = require('gulp-clean');
var minify = require('gulp-minify');
var gulpSequence = require('gulp-sequence');

var gnf = require('gulp-npm-files');

/* path def */
var path = {
    HTML: [
        // 'app/.htaccess',
        'app/**/*.html',
        'app/favicon.png'
    ],
    JS: [
        'app/**/*.js'
    ],
    CSS: [
        'app/**/*.css'
    ],
    // LESS: [
    //     'app/less/style.less'
    // ],
    // LESS_ALL: [
    //     'app/less/*.less'
    // ],
    IMG: [
        'app/assets/**'
    ],
    DIST: './dist'
};

/* spin up distribution server */
gulp.task('connect', function () {
    connect.server({
        root: 'dist',
        port: 3000
    });
});

/* clean up dist dir */
gulp.task('clean', function () {
    return gulp.src('./dist/*', {force: true})
        .pipe(clean());
});


/* move css */
gulp.task('css', function () {
    gulp.src(path.CSS)
        .pipe(concat('app.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest(path.DIST + '/css'));
});

/* compile less */
gulp.task('less', function () {
    gulp.src(path.LESS)
        .pipe(lessDependents())
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest(path.DIST + '/css'));
});

/* concat and compress app scripts */
gulp.task('js', function () {
    gulp.src(path.JS)
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        // .pipe(ngAnnotate())
        // .pipe(minify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.DIST + '/js'));
});

/* copy over markups */
gulp.task('html', function () {
    gulp.src(path.HTML, {base: 'app'})
        .pipe(gulp.dest(path.DIST));
});

/* compress images */
gulp.task('img', function () {
    gulp.src(path.IMG)
        .pipe(imagemin())
        .pipe(gulp.dest(path.DIST + '/img'));
});

/* watch all changes */
gulp.task('watch', function () {
    gulp.watch(path.LESS_ALL, ['less']);
    gulp.watch(path.VENDOR, ['vendor']);
    gulp.watch(path.JS, ['lint', 'js']);
    gulp.watch(path.HTML, ['html']);
    gulp.watch(path.IMG, ['img']);
});
// Copy dependencies and devDependencies to build/node_modules/
gulp.task('copyAllNpmDependencies', function () {
    gulp.src(gnf(true), {base: './'}).pipe(gulp.dest('dist/'));
});

gulp.task('build', gulpSequence(['clean'], ['copyAllNpmDependencies', 'html', 'css', 'js', 'img']));
gulp.task('serve', gulpSequence(['build'], 'connect'));
