var masala = require('../');
var a = require('assert');


describe('masala', function(){

	it('should masala in the I-totally-made-this-up sense, taking the arity from the default options', function(){
		var sum5 = function(o){ return o.a + o.b + o.c + o.d + o.e };
		var sum5C = masala(sum5, { a: null, b: null, c: null, d: null, e: null });

		a.equal(
			sum5({ a: 1, b: 2, c: 3, d: 4, e: 5 }),
			sum5C({a: 1})({b: 2})({c: 3})({d: 4})({e: 5}));
	});

	it('should be pure - each new argument should not affect the overall list', function(){
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

	it('should allow multiple arguments to be passed at a time', function(){
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: null, b: null, c: null });

		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1, b: 2 })({ c: 3 }));
		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1 })({ b: 2, c: 3 }));
		a.equal(sum3({ a: 1, b: 2, c: 3 }), sum3({ a: 1 })({ b: 2 })({ c: 3 }));
	});

	it('should allow allow default arguments to be passed', function(){
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: null, b: null, c: 3 });

		a.equal(sum3({ a: 1, b: 2 }), 6);
	});

	it('should allow allow default arguments to be overridden', function(){
		var sum3 = masala(function(o){ return o.a + o.b + o.c }, { a: 1, b: null, c: 3 });

		a.equal(sum3({ b: 2 }), sum3({ a: 3, b: 2, c: 1 }));
	});
});
