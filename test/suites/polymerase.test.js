/* polymerase.test.js
 * Tests polymerase function
 * Dependencies: assert, jsdom modules, mocha context
 * Author: Joshua Carter
 * Created: July 07, 2017
 */
"use strict";
//include dependencies
var assert = require('assert'),
    JSDOM = require('jsdom').JSDOM;
    
//begin mocha tests
describe('polymerase', function () {
    describe('Can be included', function () {
        var testScriptTag = function (filename, done) {
            //include the file via a script tag
            var dom = new JSDOM(
                `
<html><head><script src="${filename}"></script></head></html>
                `, 
                {
                    url: `file://${__dirname}`,
                    runScripts: "dangerously",
                    resources: "usable"
                }
            );
            //wait for script to load
            dom.window.document.onload = function () {
                try {
                    //console.log("loaded");
                    assert.equal(typeof dom.window.polymerase, "function");
                    done();
                }
                catch (e) {
                    done(e);
                }
            };

        };

        it ("Via a script tag", function (done) {
            testScriptTag("../dist/polymerase.js", done);
        });

        it ("Via a script tag using minified script", function (done) {
            testScriptTag("../dist/polymerase.min.js", done);
        });

        it ("Via CommonJS", function () {
            //include using CommonJS
            var polyInc = require('../../build/polymerase.js');
            //should have been imported
            assert.equal(typeof polyInc, "function");
        });
        
        it ("Via RequireJS", function (done) {
            //include the file via a script tag
            var dom = new JSDOM(
                `
<html><head>
    <script src="../node_modules/requirejs/require.js"></script>
    <script>
        //include using RequireJS
        requirejs(['../dist/polymerase.js'], function (polyInc) {
            window.onPolyLoad(polyInc);
        });
    </script>
</head></html>
                `, 
                {
                    url: `file://${__dirname}`,
                    runScripts: "dangerously",
                    resources: "usable"
                }
            );
            //wait for script to load
            dom.window.onPolyLoad = function (polyInc) {
                try {
                    //console.log("loaded");
                    assert.equal(typeof polyInc, "function");
                    done();
                }
                catch (e) {
                    done(e);
                }
            };
        });
    });
});
