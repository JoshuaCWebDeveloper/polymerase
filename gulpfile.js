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
    appName: "polymerase",
    bundleDir: "dist",
    bundleName: "polymerase",
    wpSingleEntryPoint: "./src/polymerase.js",
    wpExtOptions: {
        output: {
            library: "polymerase",
            libraryTarget: "umd"
        }
    },
    gitCommitterName: "PolymeraseDevTasks"
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
 - release major|minor|patch
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

//create a new release and push it to master
gulp.task('release', function () {
    return DevOps.release().done();
});

//create dummy tasks so that we can use non-hyphentated arguments
var dummy = function () {
        return;
    },
    dummies = ['patch', 'minor', 'major'];
for (let i=0; i<dummies.length; i++) {
    gulp.task(dummies[i], dummy);
}
