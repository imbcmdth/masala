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

		var toArray = function () { return call.apply(slice, arguments); }

		var not = function (fn) { return function() { return !fn.apply(this, arguments); }; };

		var nullOrUndefined = function(e) { return this[e] == null; };
		var notNullOrUndefined = not(nullOrUndefined);

		var existsIn = function (e) { return this.indexOf(e) != -1; };
		var doesntExistIn = not(existsIn);

		var merge = function (dest, source) {
			var validKeys = Object.keys(source).filter(notNullOrUndefined, source);

			validKeys.forEach(function (e) {
				dest[e] = source[e];
			});

			return dest;
		};

		var theTypeOf = function (thing) {
			var type = toString.call(thing);
			return type.toLowerCase().match(/^\[object (.+)\]$/)[1];
		};

		var genSauce = function (fn, optsPosition, existingOpts, optsRemaining, args) {
			return function (opts) {
				// Check to see if the first argument is a plain object
				var argsOffset = +(optsPosition !== -1
					&& theTypeOf(opts) === 'object'
					&& (opts.constructor === Object
						|| theTypeOf(opts.constructor) === 'undefined'));

				// A) Merge arguments
				var nextArgs = args.concat(toArray(arguments, argsOffset)),
				    fnLength = fn.length - (optsPosition !== -1); // remove options-object from length

				var nextOptsRemaining = optsRemaining;

				if ( argsOffset ) {
					// B) Merge options
					var optsGiven = Object.keys(opts).filter(notNullOrUndefined, opts);

					nextOptsRemaining = optsRemaining.filter(doesntExistIn, optsGiven);

					// We use `Object.create` to make a new `existingOpts` object
					// so that each masala'd function is pure
					existingOpts = merge(Object.create(existingOpts), opts);
				}

				// If the stars have aligned, we apply the result
				if ( (!nextOptsRemaining || nextOptsRemaining.length === 0) && nextArgs.length >= fnLength ) {
					if ( nextArgs.length > fnLength ) nextArgs.splice(fnLength);

					// Stick the options object back into the right place
					if ( optsPosition !== -1 ) nextArgs.splice(optsPosition, 0, existingOpts);

					return fn.apply(this, nextArgs);
				}

				return genSauce(fn, optsPosition, existingOpts, nextOptsRemaining, nextArgs);
			};
		};

		var masala = function (fn, optsPosition, opts) {
			var args = toArray(arguments, 3);

			if ( theTypeOf(optsPosition) === 'object' ) {
				opts = optsPosition;
				optsPosition = 0;
				args = toArray(arguments, 2);
			}

			if ( theTypeOf(opts) === 'object') {
				var optsRemaining = Object.keys(opts).filter(nullOrUndefined, opts),
				    defaultOpts = merge({}, opts);
			} else {
				var optsRemaining = null,
				    defaultOpts = null,
				    optsPosition = -1;

				args = toArray(arguments, 1);
			}

			return genSauce(fn, optsPosition, defaultOpts, optsRemaining, args);
		};

		return masala;
}));
