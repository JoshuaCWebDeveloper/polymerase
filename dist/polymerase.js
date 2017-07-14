(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["polymerase"] = factory();
	else
		root["polymerase"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = __webpack_require__(1);

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*** IMPORTS FROM imports-loader ***/
var define = false;

/* polymerase.js
 * Main project file, defines and exports main function
 * Dependencies: extend module
 * Author: Joshua Carter
 * Created: July 08, 2017
 */
"use strict";
//include dependencies

//define new mixin class
var Mixin = function () {
    function Mixin() {
        _classCallCheck(this, Mixin);

        //store constructor props
        this._constructorMethods = [];
        //store duplicate props (name: props)
        this._duplicateNames = {};
        //store new prototype
        this._newPrototype = {};
        //store new class
        this._newClass = null;

        //process arguments
        this._processArgs(arguments);
        //resolve duplicates
        this._resolveDuplicates();
        //create a new class
        this._createNewClass();
    }

    //GETTERS


    _createClass(Mixin, [{
        key: "newClass",
        value: function newClass() {
            return this._newClass;
        }

        //SETTERS

    }, {
        key: "_processArgs",
        value: function _processArgs(args) {
            //loop arguments
            for (var arg = 0; arg < args.length; arg++) {
                //store current collection of props
                var props = args[arg],
                    names = void 0;
                //if our current collection was actually a function
                if (typeof props == "function") {
                    //use the prototype of this function for our props
                    props = props.prototype;
                }
                //get names of props
                names = Object.getOwnPropertyNames(props);
                //loop prop names
                for (var n = 0; n < names.length; n++) {
                    var name = names[n];
                    //if this is the constructor
                    if (name == "constructor") {
                        //store constructor
                        this._constructorMethods.push(props[name]);
                        //nothing more to do
                        continue;
                    }
                    //if a prop with this name was already added
                    if (name in this._newPrototype) {
                        //create a new duplicate entry for this prop name
                        this._createNewDuplicate(name, props[name]);
                        //nothing more to do
                        continue;
                    }
                    //if a prop with this name is in duplicates
                    if (name in this._duplicateNames) {
                        //add it
                        this._addDuplicate(name, props[name]);
                        //nothing more to do
                        continue;
                    }
                    //else, this method is ready to be added to our new prototype
                    this._newPrototype[name] = props[name];
                }
            }
        }
    }, {
        key: "_createNewDuplicate",
        value: function _createNewDuplicate(name, value) {
            //create a new duplicate entry
            this._duplicateNames[name] = [];
            //if this name was already added
            if (name in this._newPrototype) {
                //add existing name value to duplicates
                this._duplicateNames[name].push(this._newPrototype[name]);
                //remove existing name from prototype
                delete this._newPrototype[name];
            }
            //add new name value
            this._addDuplicate(name, value);
        }
    }, {
        key: "_addDuplicate",
        value: function _addDuplicate(name, value) {
            this._duplicateNames[name].push(value);
        }
    }, {
        key: "_resolveDuplicates",
        value: function _resolveDuplicates() {
            var _this = this;

            var _loop = function _loop(name) {
                //TODO: Handle additional handleDuplicates options
                //MERGE:
                //determine if any of our duplicates our functions
                var haveFunction = false;
                for (var d = 0; d < _this._duplicateNames[name].length; d++) {
                    if (typeof _this._duplicateNames[name][d] == "function") {
                        haveFunction = true;
                    }
                }
                //if there were no functions
                if (!haveFunction) {
                    //then just add array of values
                    _this._newPrototype[name] = _this._duplicateNames[name];
                    //this duplicate is now resolved
                    return "continue";
                } //else, at least one of our duplicates was a function
                //add a new function that resolves our duplicate
                //function takes an array of arguments to pass to each duplicate function
                _this._newPrototype[name] = function () {
                    //store array of results
                    var results = [];
                    //loop our duplicates
                    for (var _d = 0, argI = 0; _d < _this._duplicateNames[name].length; _d++) {
                        var prop = _this._duplicateNames[name][_d],
                            args = void 0;
                        //if this is NOT a function
                        if (typeof prop != "function") {
                            //then just add value to results
                            results.push(prop);
                            //we are done with this prop
                            continue;
                        } //else, this is a function
                        //get arguments for this function
                        args = (arguments.length <= argI ? undefined : arguments[argI]) || [];
                        //call this function, pass args, store result
                        results.push(prop.apply(undefined, _toConsumableArray(args)));
                        //increment arguments index
                        argI++;
                    }
                    //now we can return our array of results
                    return results;
                };
            };

            //loop duplicates
            for (var name in this._duplicateNames) {
                var _ret = _loop(name);

                if (_ret === "continue") continue;
            }
        }
    }, {
        key: "_createNewClass",
        value: function _createNewClass() {
            //store this
            var that = this;
            //create a new class that will be the parent that we return
            this._newClass = function () {
                //the constructor function accepts an array of arguments
                //for each constructor function that was given to us
                function _class() {
                    _classCallCheck(this, _class);

                    //loop constructors
                    for (var c = 0; c < that._constructorMethods.length; c++) {
                        //get arguments for this constructor
                        var args = arguments[c] || [],

                        //call constructor, pass args, store result
                        instance = new (Function.prototype.bind.apply(that._constructorMethods[c], [null].concat(_toConsumableArray(args))))(),

                        //get own enumerable properties
                        props = Object.keys(instance);
                        //extend this with result 
                        for (var k = 0; k < props.length; k++) {
                            var prop = props[k];
                            this[prop] = instance[prop];
                        }
                    }
                }

                return _class;
            }();
            //now extend the prototype of our new class with our new prototype
            for (var name in this._newPrototype) {
                //use defineProperty to set properties as non-enumerable
                Object.defineProperty(this._newClass.prototype, name, {
                    configurable: true,
                    writable: true,
                    value: this._newPrototype[name]
                });
            }
        }
    }]);

    return Mixin;
}();
//define main function


function main() {
    //create new mixin
    var mixin = new (Function.prototype.bind.apply(Mixin, [null].concat(Array.prototype.slice.call(arguments))))();
    //return new parent class
    return mixin.newClass();
}
//export main function
module.exports = main;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*** IMPORTS FROM imports-loader ***/
var define = false;

'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};



/***/ })
/******/ ]);
});