/* polymerase.js
 * Main project file, defines and exports main function
 * Dependencies: extend module
 * Author: Joshua Carter
 * Created: July 08, 2017
 */
"use strict";
//include dependencies

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require("extend");

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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