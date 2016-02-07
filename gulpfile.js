'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel'); //编译es6
const minifyCss = require('gulp-minify-css'); //css压缩
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const rename = require('gulp-rename'); //重命名

const onError = function (err) {
    notify.onError({
        title: "编译出错",
        message: err.message.replace(/.+\/(.+\.(jsx|js).+)/g, '$1'),
        sound: "Beep"
    })(err);
};

const PATH = {
    SCRIPT: ['src/**/*.js', 'src/**/*.jsx'],
    HTML: ['src/**/*.html'],
    CSS: ['src/**/*.css'],
    IMG: ['src/**/*.png', 'src/**/*.jpg', 'src/**/*.svg', 'src/**/*.gif', 'src/**/*.bmp'],
    FONT: ['src/**/*.ttf', 'src/**/*.woff']
}

gulp.task('css', function() {
   gulp.src(PATH.CSS).pipe(minifyCss()).pipe(gulp.dest('asset'));
});

gulp.task('img', function() {
    gulp.src(PATH.IMG).pipe(gulp.dest('asset'));
});

gulp.task('font', function() {
    gulp.src(PATH.FONT).pipe(gulp.dest('asset'));
});

gulp.task('html', function () {
    gulp.src(PATH.HTML).pipe(gulp.dest('asset'));
});

gulp.task('script', function () {
    gulp.src(PATH.SCRIPT).pipe(plumber({
        errorHandler: onError
    })).pipe(babel({
        compact: false
    })).pipe(plumber({
        errorHandler: onError
    })).pipe(rename({
        extname: '.js'
    })).pipe(gulp.dest('asset'));
});

gulp.task('watch', function () {
    gulp.watch(PATH.SCRIPT, ['script']);
    gulp.watch(PATH.CSS, ['css']);
    gulp.watch(PATH.HTML, ['html']);
    gulp.watch(PATH.IMG, ['img']);
    gulp.watch(PATH.FONT, ['font']);
});

gulp.task('default', ['html', 'script', 'css', 'img', 'font', 'watch']);
