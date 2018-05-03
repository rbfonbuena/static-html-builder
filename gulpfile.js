const gulp = require('gulp')
const gp = gulp.parallel
const gs = gulp.series
const hbs = require('gulp-compile-handlebars')
const bs = require('browser-sync')
const df = require('dateformat')
const del = require('del')
const plugin = require('gulp-load-plugins')()

const pattern = /#\{timestamp\(\)}/g

var paths = {
    src: { root: 'src' },
    dist: { root: 'dist' },
    assets: { root: 'assets' },
    init: function () {
        this.src.scss       = this.src.root + '/scss/*.scss'
        this.src.pages      = this.src.root + '/pages/*.hbs'
        this.src.partials   = this.src.root + '/partials/**/*.hbs'
        this.src.js         = this.src.root + '/js/*.js'
        this.src.jslibs     = this.src.root + '/js/libs/*'

        this.dist.css       = this.dist.root + '/css'
        this.dist.js        = this.dist.root + '/js'
        this.dist.jslibs    = this.dist.root + '/js/libs'

        return this
    }
}.init()

// Templates
gulp.task('templates', () => {
    return gulp.src([paths.src.pages])
        .pipe(hbs({}, {
            ignorePartials: true,
            batch: ['./src/partials']
        }))
        .pipe(plugin.rename({
            extname: '.html'
        }))
        .pipe(gulp.dest(paths.dist.root))
})

// Stylesheets
gulp.task('styles', () => {
    var options = {
        outputStyle: 'expanded',
        sourceMap: true,
        sourceMapEmbed: true,
        errLogToConsole: true,
        includePaths: ['src/scss']
    }
    var now = new Date()
    var stamp = df(now, 'yyyy-mm-dd HH:MM:ss TT Z')
    return gulp.src([paths.src.scss])
        .pipe(plugin.replace(pattern, stamp))
        .pipe(plugin.sass(options))
        .pipe(plugin.autoprefixer({
            browsers: ['> 1%', 'android >= 4', 'ff >= 20'],
            cascade: false
        }))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(bs.stream())
})

// Server
gulp.task('serve', (done) => {
    bs.init({
        server: paths.dist.root,
        open: false,
        online: false
    })
    done()
})

// Watcher
gulp.task('watch', () => {
    gulp.watch(paths.src.scss, gp('styles'))
    gulp.watch([paths.src.pages, paths.src.partials], gp('templates'))
    // gulp.watch(paths.src.js, gp(scripts)).on('change', bs.reload)
    // gulp.watch(paths.src.jslibs, gp(jslibs)).on('change', bs.reload)
})

gulp.task('clean', () => {
    return del(['dist'])
})

var tasks = gs('clean', 'styles', 'templates')
gulp.task('dev', gp(tasks, 'serve', 'watch'))
gulp.task('build', tasks)
