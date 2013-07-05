var masala = require('../');
var a = require('assert');


describe('masala', function(){

	it('should masala in the I-totally-just-made-this-up sense, taking the arity from the default options', function(){
		var sum5 = function(o){ return o.a + o.b + o.c + o.d + o.e };
		var sum5C = masala(sum5, { a: null, b: null, c: null, d: null, e: null });

		a.equal(
			sum5({ a: 1, b: 2, c: 3, d: 4, e: 5 }),
			sum5C({a: 1})({b: 2})({c: 3})({d: 4})({e: 5}));
	});

	it('should masala arguments after the first in the haskell sense, taking the arity from the function', function(){
		var sum5 = function(o, d, e){ return o.a + o.b + o.c + d + e };
		var sum5C = masala(sum5, { a: null, b: null, c: null });

		a.equal(
			sum5({ a: 1, b: 2, c: 3 }, 4, 5 ),
			sum5C({a: 1}, 4)({b: 2})({c: 3})(5));
		a.equal(
			sum5({ a: 1, b: 2, c: 3 }, 4, 5 ),
			sum5C(4)({a: 1})({b: 2})({c: 3}, 5));
	});

	it('should drop "extra" arguments', function(){
		var reportArgs = masala(function(o, a, b){ return [].slice.call(arguments) }, { a: 1 });

		a.deepEqual(reportArgs('a', 'b', 'c', 'd', 'e'), [{ a: 1 }, 'a', 'b']);
	});

	it('should be pure - each new option should not affect the overall list', function(){
		var add = masala(function(o){ return o.a + o.b }, { a: null, b: null });
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

	it('should allow multiple options to be passed at a time', function(){
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: null, b: null, c: null });

		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1, b: 2 })({ c: 3 }));
		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1 })({ b: 2, c: 3 }));
		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1 })({ b: 2 })({ c: 3 }));
	});

	it('should allow allow default options to be passed', function(){
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: null, b: null, c: 3 });

		a.equal(sum3({ a: 1, b: 2 }), 6);
	});

	it('should allow allow default options to be overridden', function(){
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: 1, b: null, c: 3 });

		a.equal(sum3({ a: 3, b: 2, c: 3 }), 8);
	});
});
