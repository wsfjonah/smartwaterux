var gulp = require('gulp'),
	gp_concat = require('gulp-concat'),
	gp_rename = require('gulp-rename'),
	gp_uglify = require('gulp-uglify'),
	gp_sourcemaps = require('gulp-sourcemaps');

gulp.task('js-angular-lib-concat', function(){
	return gulp.src(['app/vendors/angular1.6.6.min.js',
		'app/vendors/angular-route1.6.6.min.js',
		'app/vendors/angular-sanitize.min.js',
		'app/vendors/event.min.js',
		'app/vendors/angular-animate1.6.6.min.js',
		'app/vendors/angular-aria1.6.6.min.js',
		'app/vendors/angular-material.min.js',
		'app/vendors/ocLazyLoad.min.js',
		'app/vendors/angular-translate.min.js',
		'app/vendors/angular-translate-loader-static-files.min.js',
		'app/vendors/angular-local-storage.min.js',
		'app/vendors/angular-cookies.min.js',
		'app/vendors/angular-translate-storage-cookie.min.js',
		'app/vendors/angular-translate-storage-local.min.js',
		'app/vendors/ui-bootstrap-tpls-2.1.4.min.js'
	])
	.pipe(gp_sourcemaps.init())
	.pipe(gp_concat('angular-lib.min.js'))
	.pipe(gp_uglify())
	.pipe(gp_sourcemaps.write('./'))
	.pipe(gulp.dest('dist'));
});

gulp.task('js-angular-app-concat', function(){
	return gulp.src(['app/js/app.js',
		'app/js/config.js',
		'app/js/services.js',
		'app/js/directives.js',
		'app/js/factory.js',
		'app/js/filter.js',
		'app/modules/auth/authCtrl.js'
	])
	.pipe(gp_sourcemaps.init())
	.pipe(gp_concat('angular-app.min.js'))
	.pipe(gp_uglify({ mangle: false }))
	.pipe(gp_sourcemaps.write('./'))
	.pipe(gulp.dest('dist'));
});

gulp.task('js-jquery-lib-concat', function(){
	return gulp.src(['assets/js/jquery-3.1.1.min.js',
		'assets/js/popper.min.js',
		'assets/js/bootstrap-4.0.min.js',
		'assets/js/pace.min.js',
		'assets/js/bootstrap-select.min.js'
	])
	.pipe(gp_sourcemaps.init())
	.pipe(gp_concat('jquery-lib.min.js'))
	.pipe(gp_uglify())
	.pipe(gp_sourcemaps.write('./'))
	.pipe(gulp.dest('dist'));
});

gulp.task('js-jquery-app-concat', function(){
	return gulp.src(['assets/js/sticky-kit.min.js',
		'assets/js/jquery.slimscroll.js',
		'assets/js/waves.js',
		'assets/js/sidebarmenu.js',
		'assets/js/xpro_core.js',
		'assets/js/custom.js'
	])
	.pipe(gp_sourcemaps.init())
	.pipe(gp_concat('jquery-app.min.js'))
	.pipe(gp_uglify())
	.pipe(gp_sourcemaps.write('./'))
	.pipe(gulp.dest('dist'));
});

gulp.task('default', ['js-angular-lib-concat','js-angular-app-concat','js-jquery-lib-concat','js-angular-app-concat','js-jquery-lib-concat','js-jquery-app-concat'], function(){});