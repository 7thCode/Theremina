'use strict';

let gulp = require('gulp');
let fs = require('graceful-fs');

let rimraf = require('rimraf');
let imagemin = require('gulp-imagemin');
let cssmin = require('gulp-cssmin');

let license = require('gulp-header');
let uglifyjs = require('uglify-es');
let composer = require('gulp-uglify/composer');
let pump = require('pump');
let minify = composer(uglifyjs, console);

gulp.task('clean', (cb) => {
    rimraf('./product/blog0', cb);
});

gulp.task('copy', ['clean'], () => {
    return gulp.src(
        [
            'config/systems/config.json',
            'config/systems/logs.json',
            'config/default.json',
            'config/production.json',
            'logs/*',
            'models/**/*.json',
            'public/css/**/*.css',
            'public/img/**/*',
            'public/js/**/*.js',
            'public/vendor/**/*',
            'public/favicons/**/*',
            'public/applications/front/files/**/*',
            'public/systems/common/shape_edit/image/*',
            'server/systems/common/shape_edit/image/*',
            'public/systems/resources/files/**/*',
            'public/systems/files/files/**/*',
            'views/**/*.pug',
            'package.json',
            'bower.json',
            'htdigest',
            '.bowerrc',
            'cluster.json'
        ],
        {base: '..'}
    )
        .pipe(gulp.dest('product'));
});

gulp.task('imgcpy', ['copy'], () => {

    return gulp.src(
        [
            'public/img/**/*.jpg',
            'public/img/**/*.png',
            'public/applications/img/*.jpg',
            'public/applications/img/*.png',
            'public/systems/common/shape_edit/image/*.jpg',
            'public/systems/common/shape_edit/image/*.png',
            'server/systems/common/shape_edit/image/*.jpg',
            'server/systems/common/shape_edit/image/*.png',
        ],
        {base: '..'}
    )
        .pipe(gulp.dest('product'));
});

gulp.task('csscpy', ['copy'], () => {

    return gulp.src(
        [
            'public/css/**/*.css',
            'public/systems/stylesheets/**/*.css',
            'public/services/stylesheets/**/*.css',
            'public/plugins/stylesheets/**/*.css',
            'public/applications/stylesheets/**/*.css',
            'public/utility/stylesheets/**/*.css',
        ],
        {base: '..'}
    )
        .pipe(gulp.dest('product'));
});

gulp.task('scriptcpy', ['copy'], () => {

    let banner = [
        '/*',
        ' Copyright (c) 2016 7thCode.',
        ' Version: 1.0.0',
        ' Author: 7thCode.',
        ' Website: http://seventh-code.com',
        ' Issues: http://seventh-code.com',
        '*/',
        ''
    ].join('\n');

    return gulp.src(
        [
            'models/**/*.js',
            'public/*.js',
            'public/js/**/*.js',
            'public/utility/**/*.js',
            'public/applications/**/*.js',
            'public/plugins/**/*.js',
            'public/services/**/*.js',
            'public/systems/**/*.js',
            'server/**/*.js',
            'app.js',
            'gs.js'
        ],
        {base: '..'}
    )
        .pipe(license(banner))
        .pipe(gulp.dest('product'));
});

gulp.task('debugbuild', ['imgcpy', 'csscpy', 'scriptcpy'], () => {
    console.log('debug build done');
});

gulp.task('imgmin', [], () => {

    return gulp.src(
        [
            'public/img/**/*.jpg',
            'public/img/**/*.png',
            'public/applications/img/*.jpg',
            'public/applications/img/*.png',
            'public/systems/common/shape_edit/image/*.jpg',
            'public/systems/common/shape_edit/image/*.png',
            'server/systems/common/shape_edit/image/*.jpg',
            'server/systems/common/shape_edit/image/*.png',
        ],
        {base: '..'}
    )
        .pipe(imagemin())
        .pipe(gulp.dest('product'));
});

gulp.task('cssmin', [], () => {

    return gulp.src(
        [
            'public/css/**/*.css',
            'public/systems/stylesheets/**/*.css',
            'public/services/stylesheets/**/*.css',
            'public/pluguns/stylesheets/**/*.css',
            'public/applications/stylesheets/**/*.css',
            'public/utility/stylesheets/**/*.css',
        ],
        {base: '..'}
    )
        .pipe(cssmin())
        .pipe(gulp.dest('product'));
});

gulp.task('scriptmin', [], (cb) => {

    let options = {};

    let banner = [
        '/*',
        ' Copyright (c) 2017 7thCode.',
        ' Version: 1.0.0',
        ' Author: 7thCode.',
        ' Website: http://seventh-code.com',
        ' Issues: http://seventh-code.com',
        '*/',
        ''
    ].join('\n');

    pump([
            gulp.src(
                [
                    'models/**/*.js',
                    'public/*.js',
                    'public/js/**/*.js',
                    'public/utility/**/*.js',
                    'public/applications/**/*.js',
                    'public/plugins/**/*.js',
                    'public/services/**/*.js',
                    'public/systems/**/*.js',
                    'server/**/*.js',
                    'app.js',
                    'gs.js'
                ],
                {base: '..'}
            ),
            minify(options),
            license(banner),
            gulp.dest('product')
        ],
        cb
    );

});

gulp.task('production', ['copy', 'imgmin', 'cssmin', 'scriptmin'], () => {
    console.log('production done');
});

gulp.task('default', ['production'], () => {
    console.log('default done');
});
