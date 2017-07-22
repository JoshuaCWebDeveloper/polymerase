/* config.test.js
 * Tests configured functionality
 * Dependencies: assert, polymerase, sinon modules, mocha context
 * Author: Joshua Carter
 * Created: July 09, 2017
 */
"use strict";
//include dependencies
var assert = require('assert'),
    sinon = require('sinon');
    
//begin mocha tests
describe('Configuration', function () {
    var polymerase;
    beforeEach(function () {
        polymerase = require('../../build/polymerase.js');
    });
    
    describe("Should accept settings", function () {
        it ("Via init()", function () {
            //pass config
            polymerase.init({
                duplicates: 'last',
                duplicateNotify: 'warn'
            });
            //couldn't think of a way to test it, will fail if the above throws an error
            assert(true);
        });
        
        describe("And throw error if", function () {
            it ("Duplicates is anything other than 'merge', 'first', 'last', or function", function () {
                //try invalid string
                assert.throws(function () {
                    polymerase.init({duplicates: 'somethingelse'});
                });
                //try an array
                assert.throws(function () {
                    polymerase.init({duplicates: ['first', 'last']});
                });
            });
            
            it ("Duplicates notify is not non-empty string", function () {
                //try undefined
                assert.throws(function () {
                    polymerase.init({duplicateNotify: undefined});
                });
                //try empty string
                assert.throws(function () {
                    polymerase.init({duplicateNotify: ''});
                });
                //try an array
                assert.throws(function () {
                    polymerase.init({duplicateNotify: ['warn', 'log']});
                });
            });
        });
    });
    
    describe("Should handle duplicates by", function () {
        //create test strings
        var testStrings = {
                square1: "class1.square()",
                square2: "class2.square()"
            },
            test,
            initTest = function () {
                //create test functions and objects
                var newTest = {
                    class1: class {
                        square () {
                            return testStrings.square1;
                        }
                    },
                    class2: class {
                        square () {
                            return testStrings.square2;
                        }
                    },
                    merge: function (mixin) {
                        //create mixin
                        var parent = mixin(test.class1, test.class2),
                            //instantiate
                            instance = new parent(),
                            //call duplicate method, store return value
                            dupReturn = instance.square();
                        //duplicate should return results in correct order
                        assert.equal(dupReturn[0], testStrings.square1);
                        assert.equal(dupReturn[1], testStrings.square2);
                    }
                };
                return newTest;
            };
        //run init test for each test
        beforeEach(function () {
            test = initTest();
        });
        
        it ("Merging them by default", function () {
            //test merge
            test.merge(polymerase.init({
                duplicateNotify: 'off',
                duplicates: "merge"
            }));
        });
        
        it ("Merging them when configured to do so", function () {
            //configure
            var mixin = polymerase.init({
                duplicateNotify: 'off',
                duplicates: "merge"
            });
            //test merge
            test.merge(mixin);
        });
        
        it ("Using the method from the first argument when configured to do so", function () {
            var parent, instance, dupReturn,
                //configure
                mixin = polymerase.init({
                    duplicateNotify: 'off',
                    duplicates: "first"
                });
            //create mixin
            parent = mixin(test.class1, test.class2);
            //instantiate
            instance = new parent();
            //call duplicate method, store return value
            dupReturn = instance.square();
            //should have only called first
            assert.equal(dupReturn, testStrings.square1);
        });
        
        it ("Using the method from the last argument when configured to do so", function () {
            var parent, instance, dupReturn,
                //configure
                mixin = polymerase.init({
                    duplicateNotify: 'off',
                    duplicates: "last"
                });
            //create mixin
            parent = mixin(test.class1, test.class2);
            //instantiate
            instance = new parent();
            //call duplicate method, store return value
            dupReturn = instance.square();
            //should have only called first
            assert.equal(dupReturn, testStrings.square2);
        });
    
        it ("Passing the correct arguments to a handler, if configured", function () {
            var called = false,
                parent, instance,
                //configure with custom method
                mixin = polymerase.init({
                    duplicateNotify: 'off',
                    duplicates: function (propName, mixins) {
                        //should have received name of duplicate
                        assert.equal(propName, "square");
                        //should have received array of all mixins who had this duplicate
                        //(in the order they were passed)
                        assert.deepEqual(mixins, [test.class1, test.class2]);
                        called = true;
                        return function () { };
                    }
                });
            //create mixin
            parent = mixin(test.class1, test.class2);
            //instantiate
            instance = new parent();
            //function should have been called
            assert(called);
        });
        
        it ("Using the custom method returned from a handler when configured to do so", function () {
            var retValue = "customValue",
                parent, instance, dupReturn,
                //configure with custom method
                mixin = polymerase.init({
                    duplicateNotify: 'off',
                    duplicates: function () {
                        return function () {
                            return retValue;
                        };
                    }
                });
            //create mixin
            parent = mixin(test.class1, test.class2);
            //instantiate
            instance = new parent();
            //call duplicate method, store return value
            dupReturn = instance.square();
            //should have only called first
            assert.equal(dupReturn, retValue);
        });
    });
    
    describe("Should notify about duplicate methods by", function () {
        //console methods to test
        var consoleMethods = ["log", "info", "warn", "error", "trace"],
            //save old console
            oldConsole ={},
            restoreConsole = function () {
                //loop console methods
                for (let i=0; i<consoleMethods.length; i++) {
                    //restore console method
                    console[consoleMethods[i]] = oldConsole[consoleMethods[i]];
                }
            },
            testConsole = function (callback) {
                //loop console methods
                for (let i=0; i<consoleMethods.length; i++) {
                    //save current method
                    oldConsole[consoleMethods[i]] = console[consoleMethods[i]];
                    //stub console method
                    console[consoleMethods[i]] = sinon.spy();
                }
                //attempt to run callback
                try {
                    callback();
                    //now we can restore the console
                    restoreConsole();
                }
                catch (e) {
                    //first thing, restore the console
                    restoreConsole();
                    //now we can throw the error
                    throw e;
                }   //by this point, the console should have been restored
            },
            test,
            initTest = function () {
                //create test functions and objects
                var newTest = {
                    class1: class {
                        square () { }
                    },
                    class2: class {
                        square () { }
                    }
                };
                return newTest;
            };
        //run init test for each test
        beforeEach(function () {
            //reset old console
            oldConsole = {};
            //create new test
            test = initTest();
        });
        
        describe("Logging to", function () {
            it ("Console.warn() by default", function () {
                //wrap code in test console
                testConsole(function () {
                    //create mixin
                    polymerase(test.class1, test.class2);
                    //should have logged to console
                    assert(console.warn.called);
                });
            });

            it ("The console channel that is configured", function () {
                //wrap code in test console
                testConsole(function () {
                    //loop console methods
                    for (let i=0; i<consoleMethods.length; i++) {
                        //configure polymerase (will be using same export)
                        let mixin = polymerase.init({
                            duplicateNotify: consoleMethods[i]
                        });
                        //create mixin
                        mixin(test.class1, test.class2);
                        //should have logged to console
                        assert(console[consoleMethods[i]].called);
                    }
                });
            });

            it ("Console.log() if configured channel does not exist", function () {
                //wrap code in test console
                testConsole(function () {
                    //configure polymerase
                    var mixin = polymerase.init({
                        duplicateNotify: 'funky'
                    });
                    //create mixin
                    mixin(test.class1, test.class2);
                    //should have logged to console
                    assert(console.log.called);
                });
            });
        });

        it ("Doing nothing if notify setting is 'off'", function () {
            //wrap code in test console
            testConsole(function () {
                //configure polymerase
                var mixin = polymerase.init({
                    duplicateNotify: 'off'
                });
                //create mixin
                mixin(test.class1, test.class2);
                //should NOT have logged to any console channel
                for (let i=0; i<consoleMethods.length; i++) {
                    assert(!console[consoleMethods[i]].called);
                }
            });
        });
        
        describe("Outputting", function () {
            it ("Log message with name of duplicate and strategy", function () {
                //wrap code in test console
                testConsole(function () {
                    //configure polymerase
                    var mixin = polymerase.init({
                        duplicateNotify: 'log'
                    });
                    //create mixin
                    mixin(test.class1, test.class2);
                    //should have logged to console
                    assert.equal(console.log.getCall(0).args[0], 'Found duplicate property "square" and will resolve using merge strategy.');
                });
            });

            it ("Strategy name of 'handler' if strategy is function", function () {
                //wrap code in test console
                testConsole(function () {
                    //configure polymerase
                    var mixin = polymerase.init({
                        duplicateNotify: 'log',
                        duplicates: function () {}
                    });
                    //create mixin
                    mixin(test.class1, test.class2);
                    //should have logged to console
                    assert(console.log.getCall(0).args[0], 'Found duplicate property "square" and will resolve using handler strategy.');
                });
            });
        });
    });
});
