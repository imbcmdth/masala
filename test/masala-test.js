var util = require('util');
var masala = require('../');
var a = require('assert');

var slice = Array.prototype.slice;

var toArray = function(args) {
	return slice.call(args);
};

describe('masala', function () {
	it('should masala in the I-totally-just-made-this-up sense, taking the arity from the default options', function () {
		var sum5 = function(o){ return o.a + o.b + o.c + o.d + o.e };
		var sum5C = masala(sum5, { a: undefined, b: undefined, c: undefined, d: undefined, e: undefined });

		a.equal(
			sum5({ a: 1, b: 2, c: 3, d: 4, e: 5 }),
			sum5C({a: 1})({b: 2})({c: 3})({d: 4})({e: 5}));
	});

	it('should masala arguments after the first in the haskell sense, taking the arity from the function', function () {
		var sum5 = function(o, d, e){ return o.a + o.b + o.c + d + e };
		var sum5C = masala(sum5, { a: undefined, b: undefined, c: undefined });

		a.equal(
			sum5({ a: 1, b: 2, c: 3 }, 4, 5 ),
			sum5C({a: 1}, 4)({b: 2})({c: 3})(5));
		a.equal(
			sum5({ a: 1, b: 2, c: 3 }, 4, 5 ),
			sum5C(4)({a: 1})({b: 2})({c: 3}, 5));
	});

	it('should reduce the arity of the function as it\'s arguments are curried', function () {
		var withOptions = masala(function named(o, a, b){ return toArray(arguments); }, { a: undefined, b: undefined });

		a.equal(withOptions.length, 2);
		withOptions = withOptions('a');

		a.equal(withOptions.length, 1);
		withOptions = withOptions({ a: 1, b: 2 });

		a.equal(withOptions.length, 1);
		a.deepEqual(withOptions('b'), [{ a: 1, b: 2 }, 'a', 'b']);

		var withOptionsAndOffset = masala(function named(a, o, b){ return toArray(arguments); }, 1, { a: undefined, b: undefined });

		a.equal(withOptionsAndOffset.length, 2);
		withOptionsAndOffset = withOptionsAndOffset('a');

		a.equal(withOptionsAndOffset.length, 1);
		withOptionsAndOffset = withOptionsAndOffset({ a: 1, b: 2 });

		a.equal(withOptionsAndOffset.length, 1);

		a.deepEqual(withOptionsAndOffset('b'), ['a', { a: 1, b: 2 }, 'b']);

		var justFunction = masala(function named(a, b){ return toArray(arguments); }, 'a');

		a.equal(justFunction.length, 1);

		a.deepEqual(justFunction('b'), ['a', 'b']);
	});

	it('should drop "extra" arguments', function () {
		var reportArgs = masala(function(o, a, b){ return toArray(arguments) }, { a: 1 });

		a.deepEqual(reportArgs('a', 'b', 'c', 'd', 'e'), [{ a: 1 }, 'a', 'b']);
	});

	it('should allow setting existing options to undefined making them required again', function () {
		var result = { a: 1, b: 2 };
		var reportArgs = masala(function(o){ return o; }, { a: 1, b: undefined });

		a.equal(typeof reportArgs({ a: undefined, b: 2 }), "function");
	});

	it('should let you specify a parameter offset for the options object', function () {
		var reportArgs = masala(function(a, o, b){ return toArray(arguments) }, 1, { a: undefined });

		a.deepEqual(reportArgs({ a: 1 }, 'a', 'b'), ['a', { a: 1 },'b']);
		a.deepEqual(reportArgs({ a: 1 })('a', 'b'), ['a', { a: 1 },'b']);
		a.deepEqual(reportArgs({ a: 1 })('a')('b'), ['a', { a: 1 },'b']);
	});

	it('should curry when the first parameter is not an object', function () {
		var reportArgs = masala(function(a, o, b){ return toArray(arguments) }, 1, { a: undefined });

		a.deepEqual(reportArgs('a', 'b')({ a: 1 }), ['a', { a: 1 },'b']);
		a.deepEqual(reportArgs('a')('b')({ a: 1 }), ['a', { a: 1 },'b']);
	});

	it('should masala when the first parameter is a plain object', function () {
		var reportArgs = masala(function(a, o, b){ return toArray(arguments) }, 1, { a: undefined });

		var o1 = Object.create(null);
		o1.a = 1;

		a.deepEqual(reportArgs('a', 'b')(o1), ['a', { a: 1 },'b']);
		a.deepEqual(reportArgs(o1, 'a')('b'), ['a', { a: 1 },'b']);
	});

	it('should curry when the first parameter is not a plain object', function () {
		var reportArgs = masala(function(a, o, b){ return toArray(arguments) }, 1, { a: undefined });

		function MakeObj(){ this.foo = 'bar'; };
		var constructedObj = new MakeObj;

		a.deepEqual(reportArgs(constructedObj, 'b')({ a: 1 }), [{ foo: 'bar' }, { a: 1 },'b']);
		a.deepEqual(reportArgs(constructedObj)('b')({ a: 1 }), [{ foo: 'bar' }, { a: 1 },'b']);
	});

	it('should ONLY curry when not given a defaults object', function () {
		var reportArgs = masala(function(a, b, c){ return toArray(arguments) });

		a.deepEqual(reportArgs({ a: 1 }, 'a')('b'), [{ a: 1 }, 'a', 'b']);
		a.deepEqual(reportArgs('a')('b')({ a: 1 }), ['a', 'b', { a: 1 }]);
	});

	it('should be pure - each new option should not affect the overall list', function () {
		var add = masala(function(o){ return o.a + o.b }, { a: undefined, b: undefined });
		var add1 = add({ a: 1 });
		var add2 = add({ b: 2 });
		a.equal(add1({ b: 1 }), 2);
		a.equal(add1({ b: 2 }), 3);
		a.equal(add1({ b: 3 }), 4);
		a.equal(add1({ b: 4 }), 5);

		a.equal(add2({ a: 1 }), 3);
		a.equal(add2({ a: 2 }), 4);
		a.equal(add2({ a: 3 }), 5);
		a.equal(add2({ a: 4 }), 6);
	});

	it('should be pure - each new argument should not affect the overall list', function () {
		var add = masala(function(o, b){ return o.a + b; }, { a: undefined });
		var add1 = add({ a: 1 });
		var add2 = add(2);
		a.equal(add1(1), 2);
		a.equal(add1(2), 3);
		a.equal(add1(3), 4);
		a.equal(add1(4), 5);

		a.equal(add2({ a: 1 }), 3);
		a.equal(add2({ a: 2 }), 4);
		a.equal(add2({ a: 3 }), 5);
		a.equal(add2({ a: 4 }), 6);
	});

	it('should allow multiple options to be passed at a time', function () {
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: undefined, b: undefined, c: undefined });

		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1, b: 2 })({ c: 3 }));
		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1 })({ b: 2, c: 3 }));
		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1 })({ b: 2 })({ c: 3 }));
	});

	it('should allow default options to be passed', function () {
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: undefined, b: undefined, c: 3 });

		a.equal(sum3({ a: 1, b: 2 }), 6);
	});

	it('should allow default options to be overridden', function () {
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: 1, b: undefined, c: 3 });

		a.equal(sum3({ a: 3, b: 2, c: 3 }), 8);
	});

	it('should allow constructors if called with `new`', function () {
		var testConstructor = function(o){ this.result = o.a + o.b + o.c; }
		testConstructor.prototype.other = 'foo';

		var sum3 = new masala(testConstructor, { a: 1, b: undefined, c: undefined });

		var obj = sum3({ b: 2 })({ c: 3 });

		a.equal(obj.result, 6);
		a.equal(obj.other, 'foo');
	});

	it('should work with (bad) constructors that explicitly return values', function () {
		var testConstructor = function(o){ this.result = o.a + o.b + o.c; return 'foo'; }

		var sum3 = new masala(testConstructor, { a: 1, b: undefined, c: 3 });

		var obj = sum3({ b: 2 });

		a.equal(obj, 'foo');
	});


	it('should not overwrite default object properties that are primitives', function () {
		var prim = masala(function(o){ return o.a; }, { a: false, b: undefined});

		var values = [prim({b: 1}), prim({a: true, b: 2}), prim({b: 1})];

		a.deepEqual(values, [false, true, false]);
	});

	it('should (somewhat) work with node.js\'s util.inherits function', function () {
		var testSuperConstructor = function(o){ this.result = o.a + o.b + o.c; }
		testSuperConstructor.prototype.other = 'foo';

		var superConstructor = new masala(testSuperConstructor, { a: 1, b: undefined, c: undefined });

		var testConstructor = function(o) {
			testConstructor.super_.apply(this, arguments);
			this.result += 4;
		}

		util.inherits(testConstructor, superConstructor);

		var obj = new testConstructor({ b: 2, c: 3 });

		a.equal(obj.result, 10);
		a.equal(obj.other, 'foo');
	});

	it('should consider null a bound value', function () {
		var fn = masala(function(o){ return [o.a, o.b]; }, { a: null, b: undefined});

		var values = fn({b: 1});

		a.equal(fn.options.length, 1)
		a.deepEqual(values, [null, 1]);
	});

});

describe('masala.inherits', function () {
	it('should inherit required options from the superConstructor', function () {
		var testSuperConstructor = function(o){ this.result = o.a + o.b + o.c; }
		testSuperConstructor.prototype.other = 'foo';

		var superConstructor = new masala(testSuperConstructor, { a: 1, b: undefined, c: undefined });

		var testConstructor = function(o) {
			var t = testConstructor.super_.apply(this, arguments);
			this.result += 4;
		}

		var sum3 = masala.inherits(testConstructor, superConstructor);

		var obj = sum3({ b: 2 })({c: 3 });

		a.equal(obj.result, 10);
		a.equal(obj.other, 'foo');
	});

	it('should merge new options with the inherit required options from the superConstructor', function () {
		var testSuperConstructor = function(o){ this.result = o.a + o.b; }
		testSuperConstructor.prototype.other = 'foo';

		var superConstructor = new masala(testSuperConstructor, { a: 1, b: undefined });

		var testConstructor = function(o) {
			var t = testConstructor.super_.apply(this, arguments);
			this.result += o.c;
		}

		var sum3 = masala.inherits(testConstructor, superConstructor, { c: undefined });

		var obj = sum3({ b: 2 })({c: 3 });

		a.equal(obj.result, 6);
		a.equal(obj.other, 'foo');
	});
});
