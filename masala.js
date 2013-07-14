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

		var slice = Array.prototype.slice,
		    call = Function.prototype.call,
		    toString = Object.prototype.toString;

		var toArray = function () { return call.apply(slice, arguments); },
		    not = function (fn) { return function() { return !fn.apply(this, arguments); }; },
		    nullOrUndefined = function(key) { return this[key] == null; },
		    notNullOrUndefined = not(nullOrUndefined),
		    existsIn = function (key) { return this.indexOf(key) != -1; },
		    doesntExistIn = not(existsIn),
		    isPlainObject = function (o) {
		    	return (theTypeOf(o) === 'object'
		    		&& (o.constructor === Object
		    			|| typeof o.constructor === 'undefined'));
		    }

		function merge (dest, source) {
			var validKeys = Object.keys(source)
				.filter(notNullOrUndefined, source);

			validKeys.forEach(function (key) {
				dest[key] = source[key];
			});

			return dest;
		}

		function theTypeOf (thing) {
			var type = toString.call(thing);
			return type.toLowerCase().match(/^\[object (.+)\]$/)[1];
		}

		function makeArguments (numberOfArgs) {
			var letters = [];
			for ( var i = 1; i <= numberOfArgs; i++ ) letters.push("arg" + i);
			return letters;
		}

		function wrapFunctionWithArity (arity, name, callback) {
			var argList = makeArguments(arity);
			var functionCode = 'return false || function ';
			functionCode += name + '(';
			functionCode += argList.join(', ') + ') {\n';
			functionCode += 'return fn.apply(this, arguments);\n';
			functionCode += '};'

			return Function("fn", functionCode)(callback);
		}

		function genSauce (fn, optsPosition, existingOpts, optsRemaining, args, arity, isConstructor) {
			var sauce = function (opts) {
				// Check to see if the first argument is a plain object
				var argsOffset = +(optsPosition !== -1 && isPlainObject(opts));

				// A) Merge arguments
				var nextArgs = args.concat(toArray(arguments, argsOffset)),
				    fnLength = fn.length - (optsPosition !== -1); // remove options-object from length

				var nextOptsRemaining = optsRemaining;

				if ( argsOffset ) {
					// B) Merge options
					var optsKeys = Object.keys(opts),
					    optsGiven = optsKeys.filter(notNullOrUndefined, opts),
					    optsReset = optsKeys.filter(nullOrUndefined, opts);

					nextOptsRemaining = optsRemaining
						.filter(doesntExistIn, optsGiven)
						.concat(optsReset);

					// We use `Object.create` to make a new `existingOpts` object
					// so that each masala'd function is pure
					existingOpts = merge(Object.create(existingOpts), opts);
				}

				// If the stars have aligned, we apply the result
				if ( (!nextOptsRemaining || nextOptsRemaining.length === 0) && nextArgs.length >= fnLength ) {
					if ( nextArgs.length > fnLength ) nextArgs.splice(fnLength);

					// Stick the options object back into the right place
					if ( optsPosition !== -1 ) nextArgs.splice(optsPosition, 0, existingOpts);

					if ( isConstructor ) {
						var newObj = Object.create(fn.prototype);
						var tempObj = fn.apply(newObj, nextArgs);
						return tempObj || newObj;
					} else {
						return fn.apply(this, nextArgs);
					}
				}

				var remainingArity = Math.max(0, fnLength - nextArgs.length);

				return genSauce(fn, optsPosition, existingOpts, nextOptsRemaining, nextArgs, remainingArity, isConstructor);
			};

			var wrappedSauce = wrapFunctionWithArity(arity, fn.name, sauce);
			wrappedSauce.options = (optsRemaining && optsRemaining.slice()) || [];

			return wrappedSauce;
		}

		function masala (fn, optsPosition, opts) {
			var args = toArray(arguments, 3),
			    arity = fn.length,
			    optsRemaining, defaultOpts,
			    isConstructor = !!(this && this.constructor === masala);

			if ( isPlainObject(optsPosition) ) {
				args = toArray(arguments, 2);
				opts = optsPosition;
				optsPosition = 0;
			}

			if ( isPlainObject(opts) ) {
				optsRemaining = Object.keys(opts).filter(nullOrUndefined, opts);
				defaultOpts = merge({}, opts);
				arity--;
			} else {
				args = toArray(arguments, 1);
				optsPosition = -1;
			}

			arity -= args.length;

			return genSauce(fn, optsPosition, defaultOpts, optsRemaining, args, arity, isConstructor);
		}

		return masala;
}));
