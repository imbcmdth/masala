# MASALA

Mix the secret sauce of curry-like functionality into your function's option-objects without anything **too spicy**

[![browser support](https://ci.testling.com/imbcmdth/masala.png)](https://ci.testling.com/imbcmdth/masala)

## Contents

* [Installation](#install)

* [Basic Usage](#basic-usage)

* [Intermediate Usage](#intermediate-usage)

* [Advanced Usage](#advanced-usage)

* [Constructor Usage](#constructor-usage)

* [API](#api)

* [What are they saying?](#what-are-they-saying-about-masala)

* [Versions](#versions)

* [License](#license---mit)

## Install
````bash

npm install masala
````

..then `require` masala:

````javascript
var masala = require('masala');
````

### In the browser, traditional

For the *browser*, add the following to your pages:

````html
<script src="masala.js"></script>
````

And the global function `masala` will be available.

### In the browser, using AMD (require.js)

...Or using AMD in the browser:

````javascript
require(["masala"], function(masala) {
	// ...
});
````

## Basic Usage

```javascript
function addAB (options) {
	return options.a + options.b;
}

//-- Creating a masala'd function is pretty straight
//-- forward:
var add = masala(addAB, { a: undefined, b: undefined });

//-- Simply pass an object that serves as a set of default
//-- options. Properties set to undefined become *required* options
//-- that must be provided (and not undefined) before the function
//-- is evaluated.

//-- It can be called like normal:
add({ a: 1, b: 2 }) //=> 3

//-- Or, if you leave out any arguments,
//-- a new function that expects all (or some) of
//-- the remaining arguments will be created:
var add1 = add({ a: 1 });
add1({ b: 2 }) //=> 3

//-- Already provided options can be overridden at any time:
add1({ a: 2, b: 2 }) //=> 4
//-- ..giving you default options behavior without adding clutter
//-- to your functions.

//-- Masala knows how many options a function should take
//-- by the number of `undefined` parameters in the defaults object

//-- In this case, the function expects an object with two arrays is
//-- expected (a, b).
//-- `zipWith` will combine two arrays using a function (fn):
var zipWith = masala(function (opts) {
	return opts.a.map(function (val, i) { return opts.fn({ a: val, b: opts.b[i] }) });
}, {
	fn: undefined,
	a: undefined,
	b: undefined
});

//-- If there are still more arguments required, a masala'd function
//-- will always return a new masala'd function:
var zipAdd = zipWith({ fn: add });
var zipAddWith123 = zipAdd({ a: [1, 2, 3] });

//-- Both functions are usable as you'd expect at any time:
zipAdd({ a: [1, 2, 3], b: [1, 2, 3] }); //=> [2, 4, 6]
zipAddWith123({ b: [5, 6, 7] }) //=> [6, 8, 10]
```

## Intermediate Usage

```javascript
//-- Masala also acts like curry for any remaining arguments after the options

function multiplyDivide (options, denom) {
	return (options.a * options.b) / denom;
}

var multDiv = masala(multiplyDivide, { a: undefined, b: undefined });

//-- If the first argument isn't an object, it is assumed to be one of
//-- the remaining arguments:
var multDivBy2 = multDiv(2);
multDivBy2({ a: 3, b: 5 }) //=> 7.5

//-- Otherwise, extra arguments after the first object are used like
//-- you would expect from standard curry-flavoring:
var multBy2Div3 = multDiv({ a: 2 }, 3);
multBy2Div3({ b: 6 }) //=> 4
````

## Advanced Usage

```javascript
//-- The second argument passed to masala can be a number representing
//-- the position of the options object in the function's parameters
//-- allowing you to curry functions where the options aren't the very
//-- first argument.

function chooseAB (a, options, b) {
	if (options.choice === "a")
		return a;
	else
		return b;
}

var chooser = masala(chooseAB, 1, { choice: undefined });

//-- You can curry the options object and create hard-wired choice:
var chooseA = chooser({ choice: 'a' });
var chooseB = chooser({ choice: 'b' });

chooseA(1, 2) //=> 1
chooseB(1, 2) //=> 2

//-- Or you can apply the arguments and leave the options object pending:
var choose12 = chooser(1, 2);

choose12({ choice: 'a' }) //=> 1
choose12({ choice: 'b' }) //=> 2

//-- Once masala'd the options object is always first and the remaining
//-- arguments are always applied in order:
chooser({choice: 'a'}, 'foo', 'bar') //=> 'foo'

//-- No matter how they are passed:
chooser({choice: 'b'})('foo', 'bar') //=> 'bar'
chooser('foo')({choice: 'a'})('bar') //=> 'foo'
````


## Constructor Usage

```javascript
function summer (o) {
	this.a = o.a;
	this.b = o.b;
}

summer.prototype.result = function (c) {
	return this.a + this.b + c
};

//-- By using `new` with masala, we tell it that the first argument is
//-- a constructor
var summer = new masala(summer, {
	a: undefined,
	b: undefined
});

//-- Once all the options for the constructor has been supplied, it executes
//-- and returns the constructed object as you would expect.
var sum12 = summer({a: 1, b: 2});

sum12.result(3); //=> 6

````

Masala also supports something very similar to node.js's `util.inherits`:


```javascript
//-- We continue using the same `summer` constructor from above

function sumMore (o) {
	// Call super constructor
	sumMore.super_.apply(this, arguments);
	this.c = o.c;
}

//-- normally we would export this constructor here:
// module.exports = masala.inherits(sumMore, summer, { c: undefined });

//-- But for the purposes of this README we will just assign it to a variable
var sum = masala.inherits(sumMore, summer, { c: undefined });

//-- Now we add any prototype functions:
sumMore.prototype.result = function (d) {
	return sumMore.super_.prototype.result.call(this, d) + this.c;
};

//-- Notice how the `sum` function's options have been merged with it's
//-- superConstructor's options:
sum.options //=> ['a', 'b', 'c']

var temp = sum({a: 1, c: 3});

//-- The `temp` variable isn't an object since not all of the required options
//-- have been bound - it is still waiting for `b`.

var finalSumMore = temp({b: 2});

//-- Now it has all of it's required options so the final object has been
//-- constructed `finalSumMore` is that object.

finalSumMore.result(4); //=> 10

````


## API

`[new] masala( yourFunction [[, paramPosition], defaultOptions] )`

* *yourFunction* `function` The function to which you wish to add some secret sauce.

* *paramPosition* `number` [optional] The position in *yourFunction*'s parameter list of the options object argument.

* *defaultOptions* `object` Any keys set to `undefined` become required parameters for the options-currying and any other parameters become default options. Default options can always be overridden later.

If neither `paramPosition` nor `defaultOptions` is provided, then *masala* functions exactly like a traditional curry over all of `yourFunction's` arguments.

If `masala` is called as a constructor (ie. with `new`) then it will invoke the first argument as a constructor function. In this way we can use `masala` to curry constructors.


`newConstructor = masala.inherits( yourConstructor, superConstructor [[, paramPosition], defaultOptions] )`

The options are the same as the base `masala` function's options. The only difference is that this *only* works with constructors and requires the `superConstructor` option (currently does no sanity checking so make sure it's included.)

The returned `newConstructor` is the masala'd constructor that should be exported with `module.exports`.

The `newConstructor` inherits any remaining *required options* from it's `superConstructor` so that calling the `superConstructor` in the constructor fucntion will only happen once all it's *required options* have been specified.

This is probably super confusing so just see [the examples](#constructor-usage).

## What are *they* saying about Masala?

[dwcook](https://github.com/dwcook/): "looks neat"

[ashnur](https://github.com/ashnur): "guess it has its usage"

[gkatsev](https://github.com/gkatsev/): "I give no quotes. Except for money."

[hughfdjackson](https://github.com/hughfdjackson/): "this is pretty cool"

## Versions

* [v2.0.1](https://github.com/imbcmdth/masala/archive/v2.0.1.zip) Removed support for `null` for specifying an unbound option. Now you MUST use only `undefined` and `null` is considered a proper, bindable, value

* [v1.3.0](https://github.com/imbcmdth/masala/archive/v1.3.0.zip) Implemented `masala.inherits` as a replacement for `util.inherits` that enables building hierarchies of masala'd functions

* [v1.2.3](https://github.com/imbcmdth/masala/archive/v1.2.3.zip) Fixed a bug that was overwriting default options under certain circumstances

* [v1.2.2](https://github.com/imbcmdth/masala/archive/v1.2.2.zip) Added constructor currying with the `new` operator

* [v1.2.1](https://github.com/imbcmdth/masala/archive/v1.2.1.zip) Fixed a few small bugs on IE and Safari

* [v1.2.0](https://github.com/imbcmdth/masala/archive/v1.2.0.zip) The curried function now correctly tracks the arity of remaining arguments and makes available the remaining options-object keys in `function.options`. In other words, the number of arguments and options remaining before the original function will be executed is `function.length + function.options.length`.

* [v1.1.1](https://github.com/imbcmdth/masala/archive/v1.1.1.zip) The first argument now requires a 'plain object' (in jQuery parlance) ie. just `{}` or `Object.create(null)`

* [v1.1.0](https://github.com/imbcmdth/masala/archive/v1.1.0.zip) Added support for standard currying of remaining function arguments

* [v1.0.0](https://github.com/imbcmdth/masala/archive/v1.0.0.zip) Initial functionality

## License - MIT

> Copyright (C) 2013 Jon-Carlos Rivera
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
