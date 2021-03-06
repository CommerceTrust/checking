////////////
//imports //
////////////


// GULP-TODO - SVG Sprites: Compiles a spritesheet from a folder of SVGs

// GULP-TODO - File size reporting

// GULP-TODO - wire uglify to js task

import gulp from 'gulp'


// helpers
import fs from 'fs'
//import path from 'path'


// Conditionals
import gulpif from 'gulp-if'
import yargs from 'yargs'


// Reloading
import browserSync from 'browser-sync'


// Error handling
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
const plumberErrorHandler = { errorHandler: notify.onError({
   title: 'Gulp',
   message: 'Error: <%= error.message %>'
 })
}


// Templating
import jade from 'gulp-jade'
import vinylYamlData from 'vinyl-yaml-data'
import deepExtend from 'deep-extend-stream'
var locals


// CSS
import stylus from 'gulp-stylus'
import poststylus from 'poststylus'


// PostCSS
import autoprefixer from 'autoprefixer'
import csswring from 'csswring'

const browserSettings = {
  browsers: [
    'ie >= 8',
    'ie_mob >= 10',
    'ff >= 3.6',
    'chrome >= 10',
    'safari >= 5.1',
    'opera >= 11',
    'ios >= 7',
    'android >= 4.1',
    'bb >= 10'
  ]
}

const cssminOptions = {
  preserveHacks: false,
  removeAllComments: true
}


// JS
import gutil from 'gulp-util'
import source from 'vinyl-source-stream'
import browserify from 'browserify'
import watchify from 'watchify'
import babelify from 'babelify'
import exorcist from 'exorcist'

import uglify from 'gulp-uglify'


// Sourcemaps
import sourcemaps from 'gulp-sourcemaps'


// Icons
import evil from 'gulp-evil-icons'


// Images
import imagmin from 'gulp-imagemin'
import imgpng from 'imagemin-pngquant'
import changed from 'gulp-changed'


// Todos
import todo from 'gulp-todo'


// Delpoy
import ghp from 'gulp-gh-pages'


///////////
// Paths //
///////////


const sendto = {
  dist: './dist'
};

const srcPath = {
  jade: './src/jade/htdocs/**/*.jade',
  yaml: './src/data/**/*.y{,a}ml',
  img: './src/img/**/*',
  stylus: './src/stylus/style.styl',
  js: './src/js/**/*.js'
};

const watchPath = {
  jade: './src/jade/**/*.jade',
  stylus: './src/stylus/**/*.styl',
  yaml: srcPath.yaml
};


//////////
//tasks //
//////////


gulp.task('todo', () => {
  gulp.src(['./src/**/*.{jade,styl,js,yaml}', './gulpfile.babel.js'])
    .pipe(todo({
      customTags: ['JS-TODO', 'JADE-TODO', 'CSS-TODO', 'YAML-TODO', 'GULP-TODO']
    }))
    .pipe(gulp.dest('.'))
    // -> Will output a TODO.md with your todos
})

var bundle = (bundler) => {
    return bundler
        .transform(babelify)
        .bundle()
        .on('error', (e) => {
            gutil.log(e.message);
        })
        .pipe(exorcist(`${sendto.dist}/app.js.map`))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(sendto.dist))
        .pipe(browserSync.stream())
}

gulp.task('jwatch', () => {
    watchify.args.debug = true;
    var watcher = watchify(browserify('./src/js/app.js', watchify.args));
    bundle(watcher);
    watcher.on('update', () => {
        bundle(watcher);
    });
    watcher.on('log', gutil.log);
});

gulp.task('js', () => {
    return bundle(browserify(sendto.dist));
});



//--------------------------


gulp.task('serve', ['stylus', 'jade', 'jwatch'], () => {
  browserSync.init({
    logFileChanges: false,
    server: {
      baseDir: sendto.dist
    }
  })

  gulp.watch(watchPath.jade, ['jade'])
  gulp.watch(watchPath.stylus, ['stylus'])
  gulp.watch(watchPath.yaml, ['jade'])
  gulp.watch(watchPath.js, ['jwatch'])
})


// Let's make a static YAML DB and make it consumable by Jade
// https://github.com/shinnn/vinyl-yaml-data
gulp.task('data', () => {
  locals = {}
  return gulp.src(srcPath.yaml)
    .pipe(vinylYamlData())
    .pipe(deepExtend(locals));
});


gulp.task('jade', ['data'], () => {
  return gulp.src(srcPath.jade)
    .pipe(plumber(plumberErrorHandler))
    //.pipe(frontMatter({ property: 'data' }))
    .pipe(jade({locals, pretty: true}))
    .pipe(evil())
    .pipe(gulp.dest(sendto.dist))
    .pipe(browserSync.stream())
});


gulp.task('stylus', () => {
  return gulp.src(srcPath.stylus)
    .pipe(plumber(plumberErrorHandler))
    .pipe(sourcemaps.init())
    .pipe(stylus({
      // Other PostCSS plugins to remember
      // cssnano
      // oldie
      // postcss-vertical-rhythm
      // postcss-zindex
      // postcss-flexbugs-fixes
      // postcss-style-guide
      // postcss-cssstats
      // list-selectors
      use: [
        poststylus([
          autoprefixer(browserSettings),
          csswring(cssminOptions),
          'pixrem',
          'postcss-pseudoelements',
          'postcss-opacity',
          'postcss-clearfix',
          'postcss-quantity-queries',
          'postcss-focus'
        ])
      ]
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(sendto.dist))
    .pipe(browserSync.stream());
})



gulp.task('default', ['serve'])

gulp.task('clog', () => {
	console.log( srcPath.yaml );
})
