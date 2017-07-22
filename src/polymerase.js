/* polymerase.js
 * Main project file, defines and exports main function
 * Dependencies: extend, jcscript, validate.js modules
 * Author: Joshua Carter
 * Created: July 08, 2017
 */
"use strict";
//include dependencies
import extend from 'extend';
import { JCObject } from 'jcscript';
import validate from 'validate.js';
var constraints;
//create custom validators
extend(validate.validators, {
    //notEmpty works on optional attributes, 
    //but ensures that when passed, they are not a falsey value
    notEmpty: function (value, opts, key, attributes) {
        //normalize opts
        var options = typeof opts == "object" ? opts : {};
        //if this prop was passed
        if (key in attributes) {
            //then it should be truthy, if it isn't
            if (!value) {
                return options.message || "should not be empty";
            }
        }   //else, it either wasn't passed, or it isn't empty
    },
    typeOf: function (value, opts) {
        //normalize opts
        var options = typeof opts == "object" ? opts : {type: opts};
        //default empty logic
        //if value is NOT of the correct type
        if (!validate.isEmpty(value) && typeof value != options.type) {
            //fail
            return options.message || `should by of type: ${options.type}`;
        }   //else, it is of the correct type
    }
});
//define validation constraints
constraints = {
    duplicates: function (value) {
        //init validators
        var validators = {
            notEmpty: true
        };
        //if value is NOT a function
        if (typeof value != "function") {
            //then apply an inclusion validation
            validators.inclusion = ["first", "last", "merge"];
        }
        //return validators
        return validators;
    },
    duplicateNotify: {
        notEmpty: true,
        typeOf: "string"
    }
};
//define new mixin class
class Mixin {
    constructor () {
        //store constructor props
        this._constructorMethods = [];
        //store original mixins as given
        this._originalArgs = [];
        //store processed mixins
        this._processedArgs = [];
        //store duplicate props (name: props)
        this._duplicateNames = {};
        //store new prototype
        this._newPrototype = {};
        //store new class
        this._newClass = null;
        //create new configurations object
        this._Config = new JCObject({
            duplicates: 'merge',
            duplicateNotify: 'warn'
        });
    }
    
    //GETTERS
    newClass () {
        return this._newClass;
    }
    
    //SETTERS
    setConfig (props) {
        //first validate props
        var validation = validate(props, constraints);
        //if there were errors
        if (validation) {
            //then throw the entire validation object joined into a string
            throw new Error(
                Object.keys(validation).map(function (k) {
                    return validation[k].join("\n");
                }).join("\n")
            );
        }   //else there were no errors
        //we want to extend object values instead of overriding them
        for (let k in props) {
            if (typeof props[k] == "object") {
                extend(true, props[k], this._Config.get(k), props[k]);
            }
        }
        //update our config
        this._Config.update(props);
    }
    
    _createNewDuplicate (name, value, i) {
        var firstIndex = -1;
        //create a new duplicate entry
        this._duplicateNames[name] = {};
        //if this name was already added
        if (name in this._newPrototype) {
            //get the index of the mixin the existing name came from
            for (let j=0; j<this._processedArgs.length; j++) {
                if (name in this._processedArgs[j]) {
                    firstIndex = j;
                    break;
                }
            }
            //if we couldn't find this name in any of the processed args
            if (firstIndex < 0) {
                //then we can't proceed
                throw new Error(`Unable to find duplicate '${name}' in processed args`);
            }   //by now, we have the index of the mixin this came from
            //add existing name value to duplicates
            this._duplicateNames[name][firstIndex] = this._newPrototype[name];
            //remove existing name from prototype
            delete this._newPrototype[name];
        }
        //add new name value
        this._addDuplicate(name, value, i);
    }
    
    _addDuplicate (name, value, i) {
        this._duplicateNames[name][i] = value;
    }
    
    
    mix (...args) {
        //store original mixins as given
        this._originalArgs = args;
        //process arguments
        this._processArgs(args);
        //resolve duplicates
        this._resolveDuplicates();
        //create a new class
        this._createNewClass();
    }
    
    _processArgs (args) {
        //loop arguments
        for (let arg=0; arg<args.length; arg++) {
            //store current collection of props
            let props = args[arg],
                names;
            //if our current collection was actually a function
            if (typeof props == "function") {
                //use the prototype of this function for our props
                props = props.prototype;
            }
            //get names of props
            names = Object.getOwnPropertyNames(props);
            //loop prop names
            for (let n=0; n<names.length; n++) {
                let name = names[n];
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
                    this._createNewDuplicate(name, props[name], arg);
                    //nothing more to do
                    continue;
                }
                //if a prop with this name is in duplicates
                if (name in this._duplicateNames) {
                    //add it
                    this._addDuplicate(name, props[name], arg);
                    //nothing more to do
                    continue;
                }
                //else, this method is ready to be added to our new prototype
                this._newPrototype[name] = props[name];
            }
            //this arg has been processed
            this._processedArgs.push(props);
        }
    }
    
    _resolveDuplicates () {
        //get duplicates strategy
        var strategy = this._Config.get("duplicates");
        //loop duplicates
        for (let name in this._duplicateNames) {
            //get keys of duplicate values
            let mixinKeys = Object.keys(this._duplicateNames[name]).sort(),
                //determine if any of our duplicates are functions
                haveFunction = false,
                //get ordered array of values for this name
                duplicateValues = mixinKeys.map((i) => {
                    //while we're mapping, also look for a function value
                    if (typeof this._duplicateNames[name][i] == "function") {
                        haveFunction = true;
                    }
                    //now, map to the value
                    return this._duplicateNames[name][i];
                });
            //send notification about this duplicate
            this._notifyDuplicate(name);
            //if we are to use the first duplicate
            if (strategy == "first") {
                //then do so
                this._newPrototype[name] = duplicateValues[0];
                //resolved
                continue;
            }
            //if we are to use the last duplicate
            if (strategy == "last") {
                //the do so
                this._newPrototype[name] = duplicateValues.slice(-1)[0];
                //resolved
                continue;
            }
            //if we are to use the result from a handler
            if (typeof strategy == "function") {
                //then do so
                this._newPrototype[name] = strategy(
                    name,
                    mixinKeys.map((i) => {
                        //map to mixin from original arguments
                        return this._originalArgs[i];
                    })
                );
                //resolved
                continue;
            }
            //else, we will merge the duplicates together
            //MERGE:
            //if there were no functions
            if (!haveFunction) {
                //then just add array of values
                this._newPrototype[name] = duplicateValues;
                //this duplicate is now resolved
                continue;
            }   //else, at least one of our duplicates was a function
            //add a new function that resolves our duplicate
            //function takes an array of arguments to pass to each duplicate function
            this._newPrototype[name] = (...allArgs) => {
                //store array of results
                var results = [];
                //loop our duplicates
                for (let d=0, argI=0; d<duplicateValues.length; d++) {
                    let prop = duplicateValues[d],
                        args;
                    //if this is NOT a function
                    if (typeof prop != "function") {
                        //then just add value to results
                        results.push(prop);
                        //we are done with this prop
                        continue;
                    }   //else, this is a function
                    //get arguments for this function
                    args = allArgs[argI] || [];
                    //call this function, pass args, store result
                    results.push(prop(...args));
                    //increment arguments index
                    argI++;
                }
                //now we can return our array of results
                return results;
            };
        }
    }
    
    _notifyDuplicate (name) {
        //get our strategy and notify setting
        var strategy = this._Config.get("duplicates"),
            notify = this._Config.get("duplicateNotify");
        //if our notify setting is off
        if (notify == "off") {
            //then do nothing
            return;
        }
        //if our notify setting is invalid
        if (typeof console[notify] != "function") {
            //then just use the log channel
            notify = "log";
        }
        //convert strategy to name if function
        if (typeof strategy == "function") {
            strategy = "handler";
        }
        //send notification
        console[notify](`Found duplicate property "${name}" and will resolve using ${strategy} strategy.`);
    }
    
    _createNewClass () {
        //store this
        var that = this;
        //create a new class that will be the parent that we return
        this._newClass = class {
            //the constructor function accepts an array of arguments
            //for each constructor function that was given to us
            constructor () {
                //loop constructors
                for (let c=0; c<that._constructorMethods.length; c++) {
                    //get arguments for this constructor
                    let args = arguments[c] || [],
                        //call constructor, pass args, store result
                        instance = new that._constructorMethods[c](...args),
                        //get own enumerable properties
                        props = Object.keys(instance);
                    //extend this with result 
                    for (let k=0; k<props.length; k++) {
                        let prop = props[k];
                        this[prop] = instance[prop];
                    }
                }
            }
        };
        //now extend the prototype of our new class with our new prototype
        for (let name in this._newPrototype) {
            //use defineProperty to set properties as non-enumerable
            Object.defineProperty(this._newClass.prototype, name, {
                configurable: true,
                writable: true,
                value: this._newPrototype[name]
            });
        }
    }
}
//define main function
function main (...args) {
    //if our main function is being executed,
    //then call init to construct new mixin function
    //(use default config)
    var executeMixin = main.init();
    //pass given args to mixin function, return result
    return executeMixin(...args);
}
//define static methods
main.init = function (props) {
    //create new mixin
    var mixin = new Mixin();
    //if we received props
    if (typeof props == "object") {
        //then we need to process our configuration
        mixin.setConfig(props);
    }
    //create and return new mixin function
    return function (...args) {
        //execute mixin
        mixin.mix(...args);
        //return new parent class
        return mixin.newClass();
    };
};
//export main function
module.exports = main;
