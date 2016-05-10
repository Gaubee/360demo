//
(function() {
	var TITLE_MAP = {};

	jSouper.registerHandle("setTitle", function(title, match_pagename) {
		var id = this._id;
		var title_config;

		if (!(title_config = TITLE_MAP[id]) && !TITLE_MAP.hasOwnProperty(id)) {
			title_config = (TITLE_MAP[id] = {
				pagename: Path.pathToRegexp(match_pagename || Path._current_location.pathname),
				title: title
			});
			//注册事件
			Path.on(title_config.pagename, function() {
				document.title = title_config.title;
			});
		}
		console.log("setTitle:", title);
		//不在事件范围内发生改变，手动改变
		if (title !== title_config.title) {
			if (title_config.pagename.exec(Path._current_location.pathname)) {
				document.title = title_config.title = title;
			}
		}
		return "";
	});
}());