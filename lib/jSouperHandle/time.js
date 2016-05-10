//
jSouper.registerHandle("#Time", function(time, format, forever) {
	time = (+time == time) ? +time : time;
	if (time == Number.MAX_VALUE) {
		return forever || "永久";
	};
	var date = moment(time);
	if (format) {
		return date.format(format);
	}
	return date.fromNow() + date.format(" LT");
});
jSouper.registerHandle("#Time_MH", function(time) {
	var date = moment("2001-1-1 " + time);
	return date.format("H:mm");
});