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

		var slice = Array.prototype.slice;
		var call = Function.prototype.call;
		var toString = Object.prototype.toString;

		var toArray = function () { return call.apply(slice, arguments); };
		var not = function (fn) { return function() { return !fn.apply(this, arguments); }; };
		var isUndefined = function(key) { return this[key] === undefined; };
		var notUndefined = not(isUndefined);
		var existsIn = function (key) { return this.indexOf(key) != -1; };
		var doesntExistIn = not(existsIn);

		function isPlainObject (o) {
			return (theTypeOf(o) === 'object'
				&& (o.constructor === Object
					|| typeof o.constructor === 'undefined'));
		}

		function getAllKeys (obj) {
			var keys = [];
			for (var key in obj) {
				if (Object.prototype.propertyIsEnumerable.call(obj, key)) {
					keys.push(key);
				}
			}
			return keys;
		}

		function merge (dest, source) {
			var validKeys = getAllKeys(source);

			validKeys.forEach(function (key) {
				dest[key] = source[key];
			});

			return dest;
		}

		function mergeNotNull (dest, source) {
			var validKeys = getAllKeys(source)
				.filter(notUndefined, source);

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
				var newExistingOpts = existingOpts;
				// Check to see if the first argument is a plain object
				var argsOffset = +(optsPosition !== -1 && isPlainObject(opts));

				// A) Merge arguments
				var nextArgs = args.concat(toArray(arguments, argsOffset)),
				    fnLength = fn.length - (optsPosition !== -1); // remove options-object from length

				var nextOptsRemaining = optsRemaining;

				if ( argsOffset ) {
					// B) Merge options
					var optsKeys = getAllKeys(opts),
					    optsGiven = optsKeys.filter(notUndefined, opts),
					    optsReset = optsKeys.filter(isUndefined, opts);

					nextOptsRemaining = optsRemaining
						.filter(doesntExistIn, optsGiven)
						.concat(optsReset);

					// We create a fresh new `existingOpts` object
					// so that each masala'd function is independent
					newExistingOpts = mergeNotNull(mergeNotNull({}, existingOpts), opts);
				}

				// If the stars have aligned, we apply the result
				if ( (!nextOptsRemaining || nextOptsRemaining.length === 0) && nextArgs.length >= fnLength ) {
					if ( nextArgs.length > fnLength ) nextArgs.splice(fnLength);

					// Stick the options object back into the right place
					if ( optsPosition !== -1 ) nextArgs.splice(optsPosition, 0, newExistingOpts);

					if ( isConstructor ) {
						if (this instanceof fn) {
							var newObj = this;
						} else {
							var newObj = Object.create(fn.prototype);
						}
						var tempObj = fn.apply(newObj, nextArgs);

						return tempObj || newObj;
					} else {
						return fn.apply(this, nextArgs);
					}
				}

				var remainingArity = Math.max(0, fnLength - nextArgs.length);

				return genSauce(fn, optsPosition, newExistingOpts, nextOptsRemaining, nextArgs, remainingArity, isConstructor);
			};

			var wrappedSauce = wrapFunctionWithArity(arity, fn.name, sauce);
			wrappedSauce.options = (optsRemaining && optsRemaining.slice()) || [];

			if (isConstructor) {
				wrappedSauce.prototype = fn.prototype;
			}

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
				optsRemaining = getAllKeys(opts).filter(isUndefined, opts);
				defaultOpts = mergeNotNull({}, opts);
				arity--;
			} else {
				args = toArray(arguments, 1);
				optsPosition = -1;
			}

			arity -= args.length;

			return genSauce(fn, optsPosition, defaultOpts, optsRemaining, args, arity, isConstructor);
		}

		// `masala.inherits` attempts to replicate the functionality of node.js's `util.inherits`
		// while also allowing curry-like handling of options.

		// To do this, `ctor` inherits any remaining options from `superCtor` so that the
		// `ctor` isn't executed until it and `superCtor` has all the options they *both*
		// require.
		masala.inherits = function (ctor, superCtor, optsPosition, opts) {
			ctor.super_ = superCtor;

			ctor.prototype = Object.create(superCtor.prototype, {
				constructor: {
					value: ctor,
					enumerable: false,
					writable: true,
					configurable: true
				}
			});

			if ( isPlainObject(optsPosition) ) {
				opts = optsPosition;
				optsPosition = 0;
			}

			var remainingOptions = superCtor.options || [];

			if (!isPlainObject(opts)) {
				opts = {};
			}

			var optionOpts = remainingOptions.reduce(function(obj, key){
				obj[key] = undefined;
				return obj;
			}, {});

			var mergedOpts = merge(opts, optionOpts);

			return new masala(ctor, optsPosition, mergedOpts);
		};

		return masala;
}));
