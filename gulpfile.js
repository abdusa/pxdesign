// Import config.js
var config        = require('./config');

// Core package for dev
var gulp          = require('gulp');
var $             = require('gulp-load-plugins')({lazy: true});
var browserSync   = require('browser-sync').create();

// NodeJS core package
var colors        = require('colors');
var fs            = require('fs');

// Declaring paths variable
var source        = config.source;
var site          = config.site;

var markup = {
  in_html   : source + config.markup + config.filename.htmlFile,
  in_pug    : source + config.markup + config.filename.pugFile,
  pugOpt    : config.projEnv !== 'production' ? true : false,
  out       : site
};

var styles = {
  in        : source + config.assetsPath.sass + config.filename.sassFile,
  out       : site + config.assetsPath.css,
  envOpt    : config.projEnv !== 'production' ? 'nested' : 'compressed'
};

var images = {
  in        : source + config.assetsPath.img,
  out       : site + config.assetsPath.img
};

var js = {
  in        : source + config.assetsPath.js,
  out       : site + config.assetsPath.js,
  jsEnvOpt  : config.projEnv !== 'production'
};

// Clean site folder
gulp.task('clean', () => {
  console.log('---------] => Cleaning site folder'.yellow);
  return gulp.src([site + '*', '!' + site + '.gitkeep'], {read: false})
    .pipe($.clean());
});

// Compiling index.pug to index.html in site folder
gulp.task('toPug', () => {
  console.log('---------] => Compiling pug/jade to html'.yellow);
  return gulp.src(markup.in_pug)
    .pipe($.plumber())
    .pipe($.pug({
      pretty: pugOpt
    }))
    .pipe(gulp.dest(site));
});

// Copying static html file if you dont using pug.
gulp.task('copyHTML', () => {
  console.log('---------] => Copying static html to site folder'.yellow);
  return gulp.src(markup.in_html)
    .pipe($.plumber())
    .pipe($.changed(site))
    .pipe(gulp.dest(site));
});

// Copying img file
gulp.task('copyImg', () => {
  console.log('---------] => Copying image'.yellow);
  return gulp.src([images.in + '*', images.in + '*/*'])
    .pipe($.changed(images.out))
    .pipe(gulp.dest(images.out))
    .pipe(browserSync.stream());
});

gulp.task('cleanImgSite', () => {
  return gulp.src([images.out + '*'], {read: false})
    .pipe($.clean());
});

// Compile sass or scss to css and add autoprefix for crossbrowser
gulp.task('toCSS', () => {
  console.log('---------] => Compiling sass to css in '.yellow + config.projEnv.yellow + ' mode'.yellow);
  return gulp.src(styles.in)
    .pipe($.plumber())
    .pipe($.sass({
      precision: 3,
      outputStyle: styles.envOpt
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', '> 1%', 'IE 8'],
      cascade: true
    }))
    .pipe(gulp.dest(styles.out))
    .pipe(browserSync.reload({stream: true}));
});

// Javascript process like minifying and concat
gulp.task('jsCompose',() => {
  if (js.jsEnvOpt) {
    console.log('---------] => Compose JS in development mode'.yellow);
    return gulp.src([js.in + '*.js', js.in + 'lib/*.js', '!' + js.in + 'vendors/*.js' ])
      .pipe($.plumber())
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.jshint.reporter('fail'))
      .pipe($.concat('main.js'))
      .pipe(gulp.dest(js.out));
  } else {
    console.log('---------] => Compose JS in production mode'.yellow);
    return gulp.src([js.in + '*.js', js.in + 'lib/*.js', '!' + js.in + 'vendors/*.js' ])
      .pipe($.plumber())
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish'))
      .pipe($.jshint.reporter('fail'))
      .pipe($.concat('main.js'))
      .pipe($.uglify())
      .pipe(gulp.dest(js.out));
  }

});

// Zipping file for production or archive it
gulp.task('zipit', () => {
  var zipParam = process.argv[3];

  switch(zipParam){
    case '--all':
      console.log('---------] => Compress all project to root directory'.yellow);
      gulp.src(['./*', '!node_modules'])
        .pipe($.zip(config.name + '.zip'))
        .pipe(gulp.dest('./'));
      break;
    case '--site-only':
      console.log('---------] => Compress all inside site folder to root directory'.yellow);
      gulp.src(site + '*')
        .pipe($.zip(config.name + '.zip'))
        .pipe(gulp.dest('./'));
      break;
    default:
      console.log('---------] => Options not correct!'.red);
      break;
  }
});

// Run browserSync
gulp.task('syncSite', () => {
  console.log('---------] => Starting browser-sync'.yellow);
  browserSync.init({
    server: {
      baseDir: site,
      index: 'index.html'
    },
    open: 'local',
    notify: false
  })
});

gulp.task('reload', () => {
  browserSync.reload()
});


// Build
gulp.task('build', ['copyHTML', 'toCSS','jsCompose', 'copyImg'], () => {
  console.log('---------] => Your in '.yellow + config.projEnv.yellow + ' mode'.yellow);
  console.log('---------] => Your project name: '.yellow + config.name.yellow + '. Building ...'.yellow);

});

// Command serve
gulp.task('serve', ['build', 'syncSite'], () => {
  console.log('---------] => Serving project and watch for change'.yellow);

  // watch sass folder
  gulp.watch(styles.in, ['toCSS']);

  // Watch index.html
  gulp.watch(markup.in_html, ['copyHTML', 'reload']);

  // Watch js folder and vendors folder
  gulp.watch([js.in + '*.js', js.in + 'lib/*.js'], ['jsCompose', browserSync.reload]);

  // Watch image folder
  gulp.watch([images.in, images.in + '*/'], ['cleanImgSite','copyImg']);
});

// help task
gulp.task('help', () => {
  console.log('|-------------------------------------------------------------------|'.magenta);
  console.log('|================= FRONTEND DEVELOPMENT KIT HELP ===================|'.magenta);
  console.log('|-------------------------------------------------------------------|'.magenta);
  console.log('|                                                                   |');
  console.log('| Usage             : gulp [command]                                |');
  console.log('| The commands for the task runner are the following.               |');
  console.log('|-------------------------------------------------------------------|');
  console.log('| help              : Print this message                            |');
  console.log('| clean             : Clean all compiled files on ./site folder     |');
  console.log('| zipit [option]    : Compress project                              |');
  console.log('|       --all       : Compress all files and folder                 |');
  console.log('|       --site-only : Compress compiled files in the ./site folder  |');
  console.log('|                                                                   |');
  console.log('| serve             : Compile, watch, and start browser-sync        |');
  console.log('| serve-with-pug    : Like serve but using pug template for html    |');
  console.log('| build             : Compile project only                          |');
  console.log('| build-with-pug    : Like build but using pug template for html    |');
  console.log('|                                                                   |');
  console.log('| Example usage     :                                               |');
  console.log('|  gulp zipit --all : Compressing all project files and folders     |');
  console.log('|                                                                   |');
  console.log('| If you want run gulp in production mode                           |');
  console.log('|  for windows      : set NODE_ENV=production&&gulp [command]       |');
  console.log('|  for *nix         : NODE_ENV=production&&gulp [command]           |');
  console.log('|                                                                   |');
  console.log('| Example usage with environment run in windows                     |');
  console.log('|                     set NODE_ENV=production&&gulp build           |');
  console.log('|                     Run gulp build in production mode             |');
  console.log('|                                                                   |');
  console.log('|-------------------------------------------------------------------|'.magenta);
});

gulp.task('default', ['help']);
