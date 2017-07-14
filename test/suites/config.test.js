/* config.test.js
 * Tests configured functionality
 * Dependencies: assert module, mocha context
 * Author: Joshua Carter
 * Created: July 09, 2017
 */
"use strict";
//include dependencies
var assert = require('assert');
    
//begin mocha tests
describe('Configuration', function () {
    it ("Can be given settings via config()");
    
    describe("Should handle duplicate methods by", function () {
        it ("Merging them by default");
        
        it ("Merging them when configured to do so");
        
        it ("Using the method from the first argument when configured to do so");
        
        it ("Using the method from the last argument when configured to do so");
        
        it ("Using the custom method returned from a handler when configured to do so");
    });
    
    describe("Should notify about duplicate methods by", function () {
        it ("Logging to console.warn() by default");
        
        it ("Logging to the console channel that is configured");
        
        it ("Logging to console.log() if configured channel does not exist");
        
        it ("Doing nothing if notify setting is 'off'");
    });
});
