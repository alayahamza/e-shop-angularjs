var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var webserver = require('gulp-webserver');
var opn = require('opn');
var clean = require('gulp-clean');
var gulpSequence = require('gulp-sequence');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

var sourcePaths = {
    styles: ['app/**/*.css'],
    scripts: ['app/**/*.js'],
    assets: ['app/assets/**/*'],
    html: [
        'app/**/*.html',
    ]
};
var DIST = './dist';
var distPaths = {
    styles: 'css',
    scripts: 'js',
    assets: 'img',

};

var server = {
    host: 'localhost',
    port: '3000'
}

gulp.task('html', function () {
    gulp.src(sourcePaths.html)
        .pipe(gulp.dest(DIST));
});
gulp.task('styles', function () {
    gulp.src(sourcePaths.styles)
        .pipe(gulp.dest(DIST + '/' + distPaths.styles));
});
gulp.task('scripts', function () {
    gulp.src(sourcePaths.scripts)
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        // .pipe(ngAnnotate())
        // .pipe(minify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DIST + '/' + distPaths.scripts));
});
gulp.task('assets', function () {
    gulp.src(sourcePaths.assets)
        .pipe(gulp.dest(DIST + '/' + distPaths.assets));
});

gulp.task('webserver', function () {
    gulp.src('./dist')
        .pipe(webserver({
            host: server.host,
            port: server.port,
            livereload: true,
            directoryListing: false
        }));
});

gulp.task('openbrowser', function () {
    opn('http://' + server.host + ':' + server.port + '/');
});

gulp.task('watch', function () {
    gulp.watch(sourcePaths.html, ['html']);
    gulp.watch(sourcePaths.styles, ['styles']);
    gulp.watch(sourcePaths.scripts, ['scripts']);
    gulp.watch(sourcePaths.assets, ['assets']);
});
gulp.task('clean', function () {
    return gulp.src('./dist/*', {force: true})
        .pipe(clean());
});
gulp.task('build', gulpSequence(['clean'], ['html', 'assets', 'scripts', 'styles']));

gulp.task('default', gulpSequence(['build'], ['webserver'], ['openbrowser'], ['watch']));