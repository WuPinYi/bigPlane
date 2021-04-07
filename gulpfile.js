var gulp = require('gulp');
var babel = require('gulp-babel');
// var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var merge = require('merge-stream');
var livereload = require('gulp-livereload');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var gulpif = require('gulp-if');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var notifier = require('node-notifier');

var livereloadPort = 36535;

var errorNotifier = function(message, options) {
	return function() {
		if (options.invokedByWatch) {
			notifier.notify({
				title: 'gulp',
				message,
				icon: __dirname + '/notifier/fail.png'
			});
		}
	}
}

var browserifyTask = function(taskOptions) {

	// Defines modules those will be used in front-end
	var dependencies = [
		'react',
		'react-dom',
		'react-router',
		'react-router-dom',
		'react-redux',
		'redux',
		'redux-thunk',
		'redux-logger',
		'whatwg-fetch',
		'rc-progress'
	];

	var tasks = [];

	// Our app bundler
	var appBundler = browserify({
		entries: [taskOptions.src], // Only need initial file, browserify finds the rest
		transform: [
			[babelify, {
				plugins: ['transform-runtime', 'transform-object-rest-spread', 'transform-class-properties'],
				presets: ['react', 'es2015', 'stage-3']
			}]
		], // We want to convert JSX to normal javascript
		debug: taskOptions.development, // Gives us sourcemapping
		cache: {},
		packageCache: {},
		fullPaths: taskOptions.development // Requirement of watchify
	});

	// We set our dependencies as externals on our app bundler when developing
	(taskOptions.development ? dependencies : []).forEach(function(dep) {
		appBundler.external(dep);
	});

	// The rebundle process
	var rebundle = function(bundleOptions) {
		var start = Date.now();
		gutil.log('Building APP bundle');
		return appBundler.bundle()
			.on('error', gutil.log)
			.on('error', errorNotifier('Failed building APP bundle', bundleOptions))
			.pipe(source('main.js'))
			.pipe(gulpif(!bundleOptions.development, streamify(uglify())))
			.pipe(gulp.dest(bundleOptions.dest))
			.pipe(gulpif(bundleOptions.livereload, livereload()))
			.pipe(notify(function() {
				var message = 'APP bundle built in ' + (Date.now() - start) + 'ms';
				gutil.log(message);
				if (bundleOptions.invokedByWatch) {
					notifier.notify({
						title: 'gulp',
						message,
						icon: __dirname + '/notifier/success.png'
					});
				}
			}));
	};

	// Fire up Watchify
	if (taskOptions.watch) {
		appBundler = watchify(appBundler);
		appBundler.on('update', function() {

			//Make a copy of taskOptions and set invokedByWatch to true
			var bundleOptions = {};
			for (var i in taskOptions)
				bundleOptions[i] = taskOptions[i];
			bundleOptions.invokedByWatch = true;

			rebundle(bundleOptions)
		});
	}

	tasks.push(rebundle(taskOptions));

	// We create a separate bundle for our dependencies as they
	// should not rebundle on file changes. This only happens when
	// we develop. When deploying the dependencies will be included
	// in the application bundle
	if (taskOptions.development) {
		var vendorsBundler = browserify({
			debug: true,
			require: dependencies
		});

		// Run the vendor bundle
		var start = new Date();
		gutil.log('Building VENDORS bundle');
		tasks.push(vendorsBundler.bundle()
			.on('error', gutil.log)
			.pipe(source('vendors.js'))
			.pipe(gulpif(!taskOptions.development, streamify(uglify())))
			.pipe(gulp.dest(taskOptions.dest))
			.pipe(notify(function() {
				gutil.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
			})));
	}

	return merge(...tasks);
}

var serverTask = function(taskOptions) {

	var rebuild = function(buildOptions) {
		var start = new Date();
		return gulp.src(buildOptions.src, {
				base: buildOptions.base
			})
			// .pipe(sourcemaps.init())
			.pipe(babel({
				plugins: ['transform-runtime', 'transform-class-properties', 'transform-object-rest-spread'],
				presets: ['es2015', 'stage-3']
			}))
			.on('error', gutil.log)
			.on('error', errorNotifier('Failed building server', buildOptions))
			// .pipe(sourcemaps.write('.'))
			.pipe(gulp.dest(buildOptions.dest))
			.pipe(notify(function(file) {
				var message = '(Server) ' + file.relative + ' built in ' + (Date.now() - start) + 'ms';
				gutil.log(message);
				if (buildOptions.invokedByWatch) {
					notifier.notify({
						title: 'gulp',
						message,
						icon: __dirname + '/notifier/success.png'
					});
				}
			}));
	}

	if (taskOptions.watch) {
		gulp.watch(taskOptions.src, function(file) {

			//Make a copy of taskOptions and set src to path of changed file
			var buildOptions = {};
			for (var i in taskOptions)
				buildOptions[i] = taskOptions[i];
			buildOptions.src = file.path;

			//Send OS notification
			buildOptions.invokedByWatch = true;

			rebuild(buildOptions);

		});
	}

	return rebuild(taskOptions);
}

var sassTask = function(taskOptions) {
	var build = (buildOptions) => {
		var start = new Date();
		return gulp.src(buildOptions.src)
			.pipe(concat('main.css'))
			.pipe(sass({
					outputStyle: buildOptions.development ? null : 'compressed'
				})
				.on('error', sass.logError))
			.on('error', errorNotifier('Failed building SASS bundle', buildOptions))
			.pipe(gulp.dest(buildOptions.dest))
			.pipe(notify(function() {
				var message = 'SASS bundle built in ' + (Date.now() - start) + 'ms';
				gutil.log(message);
				if (buildOptions.invokedByWatch) {
					notifier.notify({
						title: 'gulp',
						message,
						icon: __dirname + '/notifier/success.png'
					});
					if (buildOptions.livereload)
						livereload.reload();
				}
			}));
	}

	gulp.watch(taskOptions.src, function() {

		//Make a copy of taskOptions and set invokedByWatch to true

		var buildOptions = {};
		for (var i in taskOptions)
			buildOptions[i] = taskOptions[i];
		buildOptions.invokedByWatch = true;

		build(buildOptions);
	});

	return build(taskOptions);
}

var copyTask = function(taskOptions) {

	var copy = function(copyOptions) {

		var filesCount = 0;
		if (!copyOptions.invokedByWatch)
			gutil.log('Copying files from ' + copyOptions.src + '...');

		return gulp.src(copyOptions.src, {
				base: copyOptions.base
			})
			.pipe(gulp.dest(copyOptions.dest))
			.pipe(notify(function(file) {
				filesCount++;
				if (copyOptions.invokedByWatch) {
					var message = file.relative + ' copied';
					gutil.log(message);

					//Send OS notification
					notifier.notify({
						title: 'gulp',
						message,
						icon: __dirname + '/notifier/success.png'
					});
					//Live realod
					if (copyOptions.livereload)
						livereload.reload();
				}
			}))
			.on('finish', function() {
				if (!copyOptions.invokedByWatch)
					gutil.log(filesCount + ' files copied');
			});
	}

	if (taskOptions.watch) {
		gulp.watch(taskOptions.src, function(file) {
			var copyOptions = {};
			for (var i in taskOptions)
				copyOptions[i] = taskOptions[i];
			copyOptions.src = file.path;
			copyOptions.invokedByWatch = true;
			copy(copyOptions);
		})
	}

	return copy(taskOptions);
}

gulp.task('watch', function() {
	var tasks = [];

	livereload.listen({
		port: livereloadPort
	});

	tasks.push(serverTask({
		watch: true,
		development: true,
		src: ['./src/server/**/*.js'],
		base: './src/server',
		dest: './build'
	}));

	tasks.push(copyTask({
		watch: true,
		livereload: true,
		src: ['./src/static/**/*.*'],
		base: './src/static',
		dest: './build'
	}));

	tasks.push(browserifyTask({
		watch: true,
		livereload: true,
		development: true,
		src: ['./src/client/app.jsx'],
		dest: './build/public/scripts'
	}));

	tasks.push(sassTask({
		development: true,
		watch: true,
		livereload: true,
		src: ['./src/client/styles/**/*.css', './src/client/styles/**/*.scss', './src/client/styles/**/*.sass'],
		dest: './build/public/styles'
	}));

	return merge(...tasks);
});