//
jSouper.registerHandle("#Fixed", function(value, fixnum) {
	fixnum = ~~fixnum || 2;
	value = parseFloat(value) || 0;
	value = Math.pow(10, fixnum) * value;
	value = Math.round(value);
	value = value / Math.pow(10, fixnum);
	return value.toFixed(fixnum);
});

jSouper.registerHandle("#Int", function(value) {
	return parseInt(value) || 0;
});