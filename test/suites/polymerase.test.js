/* polymerase.test.js
 * Tests polymerase function
 * Dependencies: assert, extend, jsdom modules, mocha context
 * Author: Joshua Carter
 * Created: July 07, 2017
 */
"use strict";
//include dependencies
var assert = require('assert'),
    extend = require('extend'),
    JSDOM = require('jsdom').JSDOM,
    polymeraseMain = require('../../build/polymerase.js');
    
//begin mocha tests
describe('polymerase', function () {
    describe('Can be included via', function () {
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

        it ("A script tag", function (done) {
            testScriptTag("../dist/polymerase.js", done);
        });

        it ("A script tag using minified script", function (done) {
            testScriptTag("../dist/polymerase.min.js", done);
        });

        it ("CommonJS", function () {
            //include using CommonJS
            var polyInc = require('../../build/polymerase.js');
            //should have been imported
            assert.equal(typeof polyInc, "function");
        });
        
        it ("RequireJS", function (done) {
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
    
    describe("Can create mixin", function () {
        //create test strings
        var testStrings = {
                add: "obj1.add()",
                subtract: "obj2.suctract()",
                multiply: "func1.multiply()",
                divide: "func2.divide()",
                factor: "func3.factor()",
                square: "class1.square()"
            },
            //use value of 2
            testInitValue = 2,
            test,
            initTest = function () {
                //create test functions and objects
                var newTest = {
                    func1: function (val) {
                        this.multiplied = val || testInitValue;
                        return this;
                    },
                    func2: function (val) {
                        this.divided = val || testInitValue;
                        return this;
                    },
                    func3: function (val) {
                        this.factored = val || testInitValue;
                        return this;
                    },
                    obj1: {
                        add: function () {
                            return testStrings.add;
                        }
                    },
                    obj2: {
                        subtract: function () {
                            return testStrings.subtract;
                        }
                    },
                    class1: class {
                        constructor (val) {
                            this.squared = val || testInitValue;
                        }
                        
                        square () {
                            this.squared++;
                            return testStrings.square;
                        }
                    }
                };
                //add to function prototypes
                extend(newTest.func1.prototype, {
                    multiply: function () {
                        this.multiplied++;
                        return testStrings.multiply;
                    }
                });
                extend(newTest.func2.prototype, {
                    divide: function () {
                        this.divided++;
                        return testStrings.divide;
                    }
                });
                extend(newTest.func3.prototype, {
                    factor: function () {
                        this.factored++;
                        return testStrings.factor;
                    }
                });
                return newTest;
            },
            polymerase = polymeraseMain;
        //run init test for each test
        beforeEach(function () {
            test = initTest();
        });
        
        describe("From", function () {
            it ("Two functions", function () {
                //create mixin
                var parent = polymerase(test.func1, test.func2),
                    //create instance
                    instance = new parent();
                //prototypes should be merged
                assert.equal(typeof parent.prototype.multiply, "function");
                assert.equal(typeof parent.prototype.divide, "function");
                //instance should have merged prototype
                assert.equal(instance.multiply(), testStrings.multiply);
                assert.equal(instance.divide(), testStrings.divide);
            });

            it ("Two objects", function () {
                //create mixin
                var parent = polymerase(test.obj1, test.obj2),
                    //create instance
                    instance = new parent();
                //prototypes should be merged
                assert.equal(typeof parent.prototype.add, "function");
                assert.equal(typeof parent.prototype.subtract, "function");
                //instance should have merged prototype
                assert.equal(instance.add(), testStrings.add);
                assert.equal(instance.subtract(), testStrings.subtract);
            });

            it ("One object, one function", function () {
                //create mixin
                var parent = polymerase(test.obj1, test.func1),
                    instance = new parent();
                //prototypes should be merged
                assert.equal(typeof parent.prototype.add, "function");
                assert.equal(typeof parent.prototype.multiply, "function");
                //instance should have merged prototype
                assert.equal(instance.add(), testStrings.add);
                assert.equal(instance.multiply(), testStrings.multiply);
            });

            it ("One function, one class", function () {
                //create mixin
                var parent = polymerase(test.func1, test.class1),
                    //create instance
                    instance = new parent();
                //prototypes should be merged
                assert.equal(typeof parent.prototype.multiply, "function");
                assert.equal(typeof parent.prototype.square, "function");
                //instance should have merged prototype
                assert.equal(instance.multiply(), testStrings.multiply);
                assert.equal(instance.square(), testStrings.square);
            });

            it ("Three arguments", function () {
                //create mixin
                var parent = polymerase(test.obj1, test.func1, test.func2),
                    //create instance
                    instance = new parent();
                //prototypes should be merged
                assert.equal(typeof parent.prototype.add, "function");
                assert.equal(typeof parent.prototype.multiply, "function");
                assert.equal(typeof parent.prototype.divide, "function");
                //instance should have merged prototype
                assert.equal(instance.add(), testStrings.add);
                assert.equal(instance.multiply(), testStrings.multiply);
                assert.equal(instance.divide(), testStrings.divide);
            });
        });
        
        describe("Constructor", function () {
            it ("From two functions", function () {
                //create mixin
                var parent = polymerase(test.func1, test.func2),
                    //create instance
                    instance = new parent();
                //should contain properties from both constructors
                assert.equal(instance.multiplied, testInitValue);
                assert.equal(instance.divided, testInitValue);
            });

            it ("From three functions", function () {
                //create mixin
                var parent = polymerase(test.func1, test.func2, test.func3),
                    //create instance
                    instance = new parent();
                //should contain properties from all three constructors
                assert.equal(instance.multiplied, testInitValue);
                assert.equal(instance.divided, testInitValue);
                assert.equal(instance.factored, testInitValue);
            });

            it ("That can accept accept arguments", function () {
                //create mixin
                var parent = polymerase(test.func1, test.class1),
                    //create instance
                    instance = new parent([3], [4]);
                //properties should have given values
                assert.equal(instance.multiplied, 3);
                assert.equal(instance.squared, 4);
            });
        });
        
        it ("That can be extended", function () {
            //create mixin
            var parent = polymerase(test.func1, test.class1),
                //create child
                child = class extends parent {
                    constructor () {
                        super([3], [4]);
                        //call methods
                        this.multiply();
                        this.square();
                    }
                    
                    output () {
                        return {
                            multiplied: this.multiplied,
                            squared: this.squared
                        };
                    }
                },
                //create instance
                instance = new child(),
                expected = {
                    multiplied: 3+1,
                    squared: 4+1
                };
            //child should be able to call parent methods to set parent props
            assert.equal(instance.multiplied, expected.multiplied);
            assert.equal(instance.squared, expected.squared);
            //child method should be able to output parent props
            assert.deepEqual(instance.output(), expected);
        });
        
        it ("Without altering given arguments or their prototypes", function () {
            //create a second test set
            var secondTest = initTest(),
                //mix stuff together (using first test)
                parent1 = polymerase(test.func1, test.func2, test.func3),
                parent2 = polymerase(test.obj1, test.func1),
                //create instances
                instance1 = new parent1(),
                instance2 = new parent2();
            //***To test the test:
            //test.func1.altered = true;
            //test.func3.prototype.altered = true;
            //:End to test the test***
            assert.deepStrictEqual(Object.getOwnPropertyNames(test.func1), Object.getOwnPropertyNames(secondTest.func1));
            assert.deepStrictEqual(Object.getOwnPropertyNames(test.func2), Object.getOwnPropertyNames(secondTest.func2));
            assert.deepStrictEqual(Object.getOwnPropertyNames(test.func3), Object.getOwnPropertyNames(secondTest.func3));
            assert.deepStrictEqual(Object.getOwnPropertyNames(test.obj1), Object.getOwnPropertyNames(secondTest.obj1));
            //prototypes should also be same
            assert.deepStrictEqual(Object.getOwnPropertyNames(test.func1.prototype), Object.getOwnPropertyNames(secondTest.func1.prototype));
            assert.deepStrictEqual(Object.getOwnPropertyNames(test.func2.prototype), Object.getOwnPropertyNames(secondTest.func2.prototype));
            assert.deepStrictEqual(Object.getOwnPropertyNames(test.func3.prototype), Object.getOwnPropertyNames(secondTest.func3.prototype));
        });
    });

    describe("Can merge", function () {
        //create test strings
        var testStrings = {
                square1: "class1.square()",
                square2: "class2.square()",
                square3: "class3.square3",
                square4: "class4.square()",
                sqrId1: "class1.sqrId1",
                sqrId2: "class2.sqrId2"
            },
            int = [34, 56, 78],
            test,
            initTest = function () {
                //create test functions and objects
                var newTest = {
                    class1: class {
                        square (arg) {
                            return [arg, testStrings.square1];
                        }
                    },
                    class2: class {
                        square (arg) {
                            return [arg, testStrings.square2];
                        }
                    },
                    class3: class {
                    
                    },
                    class4: class {
                        square (arg) {
                            return [arg, testStrings.square4];
                        }
                    }
                };
             //add props
             newTest.class1.prototype.sqrId = testStrings.sqrId1;
             newTest.class2.prototype.sqrId = testStrings.sqrId2;
             newTest.class3.prototype.square = testStrings.square3;
             return newTest;
            },
            polymerase;
        //run init test for each test
        beforeEach(function () {
            test = initTest();
            //logging off
            polymerase = polymeraseMain.init({
                duplicateNotify: 'off'
            });
        });
        
        it ("Two functions", function () {
            //store return values
            var retVals = [testStrings.square1, testStrings.square2],
                //create mixin
                parent = polymerase(test.class1, test.class2),
                //instantiate
                instance = new parent(),
                //call duplicate method, pass arguments, store return value
                dupReturn = instance.square([int[0]], [int[1]]);
            for (var i=0; i<2; i++) {
                //duplicate should return results in correct order
                assert.equal(dupReturn[i][1], retVals[i]);
                //duplicate should have received correct arguments
                assert.equal(dupReturn[i][0], int[i]);
            }
        });
        
        it ("Two values", function () {
            //store return values
            var retVals = [testStrings.sqrId1, testStrings.sqrId2],
                //create mixin
                parent = polymerase(test.class1, test.class2),
                //instantiate
                instance = new parent();
            for (var i=0; i<2; i++) {
                //duplicate should contain results in correct order
                assert.equal(instance.constructor.prototype.sqrId[i], retVals[i]);
            }
        });
        
        it ("One function, one value", function () {
            //store return values
            var retVals = [testStrings.square1, testStrings.square3],
                //create mixin
                parent = polymerase(test.class1, test.class3),
                //instantiate
                instance = new parent(),
                //call duplicate method, pass arguments, store return value
                dupReturn = instance.square([int[0]]);
            //duplicate should return result from function
            assert.equal(dupReturn[0][1], retVals[0]);
            //duplicate should have received correct arguments
            assert.equal(dupReturn[0][0], int[0]);
            //duplicate should have also return value
            assert.equal(dupReturn[1], retVals[1]);
        });
        
        it ("Three functions", function () {
            //store return values
            var retVals = [testStrings.square1, testStrings.square2, testStrings.square4],
                //create mixin
                parent = polymerase(test.class1, test.class2, test.class4),
                //instantiate
                instance = new parent(),
                //call duplicate method, pass arguments, store return value
                dupReturn = instance.square([int[0]], [int[1]], [int[2]]);
            for (var i=0; i<3; i++) {
                //duplicate should return results in correct order
                assert.equal(dupReturn[i][1], retVals[i]);
                //duplicate should have received correct arguments
                assert.equal(dupReturn[i][0], int[i]);
            }
        });
        
        it ("Mix of three functions and values", function () {
            //store return values
            var retVals = [testStrings.square1, testStrings.square2, testStrings.square3],
                //create mixin
                parent = polymerase(test.class1, test.class2, test.class3),
                //instantiate
                instance = new parent(),
                //call duplicate method, pass arguments, store return value
                dupReturn = instance.square([int[0]], [int[1]]);
            for (var i=0; i<2; i++) {
                //duplicate should return results in correct order
                assert.equal(dupReturn[i][1], retVals[i]);
                //duplicate should have received correct arguments
                assert.equal(dupReturn[i][0], int[i]);
            }
            //duplicate should have also return value
            assert.equal(dupReturn[2], retVals[2]);
        });
    });
});
