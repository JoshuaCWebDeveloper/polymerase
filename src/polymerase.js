/* polymerase.js
 * Main project file, defines and exports main function
 * Dependencies: extend module
 * Author: Joshua Carter
 * Created: July 08, 2017
 */
"use strict";
//include dependencies
import extend from 'extend';
//define new mixin class
class Mixin {
    constructor () {
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
    newClass () {
        return this._newClass;
    }
    
    //SETTERS
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
    
    _createNewDuplicate (name, value) {
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
    
    _addDuplicate (name, value) {
        this._duplicateNames[name].push(value);
    }
    
    
    _resolveDuplicates () {
        //loop duplicates
        for (let name in this._duplicateNames) {
            //TODO: Handle additional handleDuplicates options
            //MERGE:
            //determine if any of our duplicates our functions
            let haveFunction = false;
            for (let d=0; d<this._duplicateNames[name].length; d++) {
                if (typeof this._duplicateNames[name][d] == "function") {
                    haveFunction = true;
                }
            }
            //if there were no functions
            if (!haveFunction) {
                //then just add array of values
                this._newPrototype[name] = this._duplicateNames[name];
                //this duplicate is now resolved
                continue;
            }   //else, at least one of our duplicates was a function
            //add a new function that resolves our duplicate
            //function takes an array of arguments to pass to each duplicate function
            this._newPrototype[name] = (...allArgs) => {
                //store array of results
                var results = [];
                //loop our duplicates
                for (let d=0, argI=0; d<this._duplicateNames[name].length; d++) {
                    let prop = this._duplicateNames[name][d],
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
function main () {
    //create new mixin
    var mixin = new Mixin(...arguments);
    //return new parent class
    return mixin.newClass();
}   
//export main function
module.exports = main;
