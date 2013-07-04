MASALA
=====

Mix the secret sauce of curry-like functionality into your option-objects without anything **too spicy**

[![browser support](https://ci.testling.com/imbcmdth/masala.png)](https://ci.testling.com/imbcmdth/masala)

# install

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

# Usage

```javascript
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

```

## License - MIT

> Copyright (C) 2013 Jon-Carlos Rivera
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
