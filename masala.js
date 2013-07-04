(function (root, factory) {
		if (typeof exports === 'object') {
			module.exports = factory();
		} else if (typeof define === 'function' && define.amd) {
			define(factory);
		} else {
			root.masala = factory();
		}
	}(this, function () {
		"use strict";

		var not = function(fn){ return function(){ return !fn.apply(this, arguments); }; };

		var nullOrUndefined = function(e){ return this[e] == null; };
		var notNullOrUndefined = not(nullOrUndefined);

		var existsIn = function(e){ return this.indexOf(e) != -1; };
		var doesntExistIn = not(existsIn);

		var merge = function(dest, source){
			var validKeys = Object.keys(source).filter(notNullOrUndefined, source);

			validKeys.forEach(function(e){
				dest[e] = source[e];
			});

			return dest;
		};

		var ObjCreate = Object.create || function(o) { function fn(){}; fn.prototype = o; return new fn; };

		var genSauce = function(fn, existingArgs, argsRemaining){
			return function(args){
				var argsGiven = Object.keys(args).filter(notNullOrUndefined, args),
				    nextArgsRemaining = argsRemaining.filter(doesntExistIn, argsGiven);

				// We use `Object.create` to make a new `existingArgs` object
				// so that each masala'd function is pure
				existingArgs = merge(ObjCreate(existingArgs), args);

				if ( nextArgsRemaining.length === 0 ) return fn.call(this, existingArgs);

				return genSauce(fn, existingArgs, nextArgsRemaining);
			};
		};

		var masala = function(fn, args){
			var argsRemaining = Object.keys(args).filter(nullOrUndefined, args),
			    defaultArgs = merge({}, args);

			return genSauce(fn, defaultArgs, argsRemaining);
		};

		return masala;
}));
