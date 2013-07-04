var masala = require('../');

function addAB(options) {
	return options.a + options.b;
}

//-- creating a masala'd function is pretty straight
//-- forward:
var add = masala(addAB, { a: null, b: null });
//.. Simply pass an object that serves as a set of default
//.. options. Properties set to null become *required* options
//.. that must be provided (and not null) before the function
//.. is evaluated.

//-- it can be called like normal:
add({ a: 1, b: 2 }) //=> 3

//-- or, if you miss off any arguments,
//-- a new funtion that expects all (or some) of
//-- the remaining arguments will be created:
var add1 = add({ a: 1 });
add1({ b: 2 }) //=> 3

//-- already provided options can be overridden at any time:
add1({ a: 2, b: 2 }) //=> 4

//-- masala knows how many arguments a function should take
//-- by the number of `null` parameters in the default object

//-- in this case, the function expects an object with two arrays is
//-- expected (a, b).
//-- `zipWith` will combine two arrays using a function (fn):
var zipWith = masala(function(opts) {
	return opts.a.map(function(val, i){ return opts.fn({ a: val, b: opts.b[i] }) });
}, {
	fn: null,
	a: null,
	b: null
});

//-- if there are still more arguments required, a masala'd function
//-- will always return a new masala'd function:
var zipAdd = zipWith({ fn: add });
var zipAddWith123 = zipAdd({ a: [1, 2, 3] });

//-- both functions are usable as you'd expect at any time:
zipAdd({ a: [1, 2, 3], b: [1, 2, 3] }); //=> [2, 4, 6]
zipAddWith123({ b: [5, 6, 7] }) //=> [6, 8, 10]
