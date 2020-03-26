//'use strict';

var plugins       = require('gulp-load-plugins');
var yargs         = require('yargs');
var browser       = require('browser-sync');
var gulp          = require('gulp');
var panini        = require('panini');
var rimraf        = require('rimraf');
var yaml          = require('js-yaml');
var fs            = require('fs');
var webpackStream = require('webpack-stream');
var webpack2      = require('webpack');
var htmlmin       = require('gulp-htmlmin');
var gutil         = require('gulp-util');

var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var minify = require('gulp-minify');

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
    gulp.series(
        clean,
        gulp.parallel(
            pages, sass, plainCss, images, copy, webfonts, gliphicons, jsLibraries, rawjs
        )    )
);

// Build the site, run the server, and watch for file changes
gulp.task('default',
    gulp.series('build', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
    rimraf('{' + PATHS.dist + ',' + PATHS.temp + '}', done);
}

// Copy files out of the assets folder
// This task skips over the "images", "js", and "scss" folders, which are parsed separately
function copy() {
    return gulp.src(PATHS.assets)
        .pipe(gulp.dest(PATHS.dist + '/assets'));
}

function gliphicons() {
    return gulp.src('node_modules/bootstrap-sass/assets/fonts/bootstrap/**/*')
        .pipe(gulp.dest(PATHS.dist + '/assets/fonts/bootstrap/'));
}

function webfonts() {
    return gulp.src('src/assets/fonts/**/*')
        .pipe(gulp.dest(PATHS.dist + '/assets/fonts'));
}

function pages() {
    return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
        .pipe(panini({
            root: 'src/pages/',
            layouts: 'src/layouts/',
            partials: 'src/partials/',
            data: 'src/data/',
            helpers: 'src/helpers/'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(PATHS.dist));
}

function plainCss() {
    return gulp.src('src/assets/css/**/*')
        .pipe(gulp.dest(PATHS.dist + '/assets/css'));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
    panini.refresh();
    done();
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
    return gulp.src('src/assets/scss/app.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: PATHS.sass
        })
            .on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: COMPATIBILITY
        }))
        // Comment in the pipe below to run UnCSS in production
        //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
        .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/assets/css'))
        .pipe(browser.reload({ stream: true }));
}

function jsLibraries() {
    // JS Libraries from github etc (configured via config.yml)...
    return gulp.src(PATHS.jsLibs)
        .pipe(sourcemaps.init())
        .pipe(concat('libraries.js'))
        .pipe(minify({}))
        .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

function rawjs() {
    // Main JS Application
    return gulp.src('src/assets/js.raw/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('core.js'))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe($.if(PRODUCTION, $.minify({})))
        .pipe(gulp.dest(PATHS.dist + '/assets/js'));

}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
    return gulp.src('src/assets/img/**/*')
        .pipe($.if(PRODUCTION, $.imagemin({
            progressive: true
        })))
        .pipe(gulp.dest(PATHS.dist + '/assets/img'));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
    browser.init({
        server: PATHS.dist, port: PORT,
        open: false
    });
    done();
}

// Reload the browser with BrowserSync
function reload(done) {
    browser.reload();
    done();
}

// Watch for changes to static assets, pages, Sass
function watch() {
    gulp.watch(PATHS.assets, copy); 
    gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
    gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
    gulp.watch('src/assets/scss/**/*.scss').on('all', sass);
    gulp.watch('src/assets/css/**/*.css').on('all', plainCss);
    gulp.watch('src/assets/js.raw/**/*.js').on('all', gulp.series(rawjs, browser.reload));
    gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
}
