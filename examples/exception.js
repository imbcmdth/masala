var masala = require('../');

var t = function throwingFunction (options, argument) {
	_notDefined.so.it.throws;
}

var i = function intermediateFunction (options, argument) {
	return t(options, argument);
}

var m = masala(i, {foo: 'foo', bar: undefined});

!function callingContext () {
	var m2 = m({foo: 'new'});
	var m3 = m2({bar: 'value'});
	var m4 = m2({bar: 'value2'});

//	m4('arg');
	try {m4('arg');}catch(e){console.log(e.stack);}
}();
