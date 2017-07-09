/* gulpfile.js
 * Glup task-runner configruation for project
 * Dependencies: babili-webpack-plugin, child-process, eslint, fs, 
                 gulp, gulp-util, nodegit, os, path, Q, webpack, yargs modules
 * Author: Joshua Carter
 * Created: July 08, 2017
 */
"use strict";
//include modules
var DevOps = require('dev-tasks'),
    gulp = require("gulp"),
    gutil = require("gulp-util");

//configure dev-tasks
DevOps.init({
    bundleDir: "dist",
    bundleName: "polymerase",
    wpSingleEntryPoint: "./src/polymerase.js",
    wpExtOptions: {
        output: {
            library: "polymerase",
            libraryTarget: "umd"
        }
    }
});


//default gulp task: documentation
gulp.task('default', function () {
    gutil.log(
`

Available Gulp Commands:
 - lint
 - build
 - bundle
 - minify
`
    );
});

//lint code using ESLint
gulp.task('lint', function () {
    return DevOps.lint();
});

//transpile code using babel
gulp.task('build', function () {
    return DevOps.build();
});

//build code using webpack and babel
gulp.task('bundle', function () {
    return DevOps.bundle().done();
});

//build our code and minify it using webpack and babili
gulp.task('minify', function () {
    //run build again
    return DevOps.bundle().then(function () {
        //now minify
        return DevOps.bundle("production", true);
    }).done();
});
