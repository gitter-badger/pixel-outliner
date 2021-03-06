const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const wrap = require('gulp-wrap')
const concat = require('gulp-concat')
const plumber = require('gulp-plumber')
const handlebars = require('gulp-handlebars')
const defineModule = require('gulp-define-module')
const all = require('gulp-all')
const path = require('path')
const NwBuilder = require('nw-builder')

require('shelljs/global')

gulp.task('babel', () => {
    return gulp
	.src('js/**/*.js')
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(babel())
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dist/js'))
})

gulp.task('hbs_templates', () => { 
    return gulp
	.src(['templates/**/*.hbs'])
	.pipe(plumber())
	.pipe(handlebars({
	    handlebars: require('handlebars')
	}))
	.pipe(defineModule('node'))
	.pipe(gulp.dest('dist/templates/')) 
})

gulp.task('hbs_partials', () => {
    return gulp
	.src(['templates/_*.hbs'])
	.pipe(plumber())	  
	.pipe(handlebars({
	    handlebars: require('handlebars')
	}))
	.pipe(wrap(
	    `var Handlebars = require('handlebars')
	    Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>))`,
	    {}, {
		imports: {
		    processPartialName: function(fileName) {
			return JSON.stringify(path.basename(fileName, '.js').substr(1));
		    }
		}
	    }))
	.pipe(concat('partials.js'))
	.pipe(gulp.dest('dist/templates/'))
})

gulp.task('bundle', () => {
    const nw = new NwBuilder({
	files: ['./vendor/**/**', './node_modules/**/**', './dist/**/**', './css/**/**','./assets/**/**', './index.html', './package.json'],
	platforms: ['osx64'],
	version: '0.12.3',
	macIcns: './assets/icons/pxo_app_icon.icns',
	macPlist: {
	    CFBundleDocumentTypes: [{
		CFBundleTypeName: 'Pixel Outliner Outline File',
		CFBundleTypeExtensions: ['pxo'],
		CFBundleTypeIconFile: 'pxo_file_icon_64'
	    }]
	}
    })
    return nw.build().then(()=> {
	cp('./assets/icons/pxo_file_icon*.icns', './build/PixelOutliner/osx64/PixelOutliner.app/Contents/Resources')
    })
})


gulp.task('hbs', ['hbs_templates', 'hbs_partials'])
gulp.task('default', ['babel', 'hbs'])
