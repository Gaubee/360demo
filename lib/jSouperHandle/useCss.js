//
(function() {

	var USE_CSS_MAP = {};
	var require_cache = {
		"": "" //包括了空link的情况，使用缓存机制替代了
	};

	function req_css(link, cb, style_id) {
		if (require_cache.hasOwnProperty(link)) {
			var css_text = require_cache[link];
			//如果是从缓存里面直接加载过来的，加载插件是不会再次执行addSheet，所以需要手动执行
			addSheet(css_text, style_id);
			cb(css_text);
		} else {
			require(["r_css!" + link + ">STYLE_ID:" + style_id], function(css_text) {
				require_cache[link] = css_text;
				cb(css_text);
			}, function() {
				cb("");
			});
		}
	};

	function _load_css_link(use_css_config) {
		if (use_css_config.pagename.exec(Path._current_location.pathname)) { //匹配成功
			if (!use_css_config.load) { //未下载，直接下载使用并缓存
				// use_css_config.id = this._id;
				use_css_config.load = true; //锁定
				use_css_config.using = true; //锁定
				use_css_config.loading = true;
				openPageLoading("useCss:" + use_css_config.id);

				(function start_load_css() {
					var current_css_link = use_css_config.css_link;
					req_css(current_css_link, function(css_text) {
						//css_link发生改变了，重新发起请求，并删除已经加进来的css_text
						if (use_css_config.abort && current_css_link !== use_css_config.css_link) {
							use_css_config.abort = false;
							removeSheet(css_text, use_css_config.style_id);
							start_load_css();
							return;
						}
						closePageLoading("useCss:" + use_css_config.id);
						use_css_config.css_text = css_text;
						use_css_config.loading = false;
					}, use_css_config.style_id);
				}());
			} else if (!use_css_config.using) { //已经下载，直接使用
				addSheet(use_css_config.css_text, use_css_config.style_id)
				use_css_config.using = true;
			}
		} else { //不匹配
			if (use_css_config.using) { //如果使用中，进行删除
				removeSheet(use_css_config.css_text, use_css_config.style_id);
				use_css_config.using = false;
			}
		}
	}
	jSouper.registerHandle("useCss", function _use_css(css_link, match_pagename) {
		// if (!Path._current_location) {
		// 	//因为缓存问题导致运作流程有误
		// 	var self = this;
		// 	setTimeout(function() {
		// 		_use_css.apply(self, arguments);
		// 	});
		// 	return "";
		// }
		console.log("Path._current_location:", Path._current_location)
		var use_css_config;
		css_link = css_link ? Path.getPathname(css_link) : "";
		var id = this._id + css_link;
		//初始化
		if (!(use_css_config = USE_CSS_MAP[id]) && !USE_CSS_MAP.hasOwnProperty(id)) {
			use_css_config = (USE_CSS_MAP[id] = {
				id: id,
				pagename: Path.pathToRegexp(match_pagename || Path._current_location.pathname),
				css_link: css_link,
				style_id: this.vmName
			});
			Path.on("*", function() {
				_load_css_link(use_css_config);
			});
		}
		if (css_link !== use_css_config.css_link) {
			use_css_config.css_link = css_link;
			if (use_css_config.load) {
				if (use_css_config.loading) { //如果在加载中，请求抛弃这次加载，这会让其再次请求新的css_link
					use_css_config.abort = true;
				} else if (use_css_config.using) { //如果使用中，直接替换CSS文件

					//删除CSS文件
					removeSheet(use_css_config.css_text, use_css_config.style_id);
					use_css_config.using = false;

					//没有缓存的话，重新请求
					if (!require_cache.hasOwnProperty(css_link)) {
						use_css_config.load = false;
					} else {
						use_css_config.load = true;
						use_css_config.css_text = require_cache[css_link];
					}
					use_css_config.loading = false;

					//重新载入CSS文件
					_load_css_link(use_css_config);
				} else if (use_css_config.load) { //如果没使用状态，但是已经有css_text缓存，删除缓存，等要使用的时候在动态加载
					use_css_config.load = false;
					use_css_config.css_text = "";
				}
			}
		}
		return "";
	});

}());