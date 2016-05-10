//
/*
 * Path 页面URL处理器
 */
window._can_history_pushState = !!history.pushState;
(function() {

	//事件注册器
	var Path = {};
	var _events = Path._events = [];
	var _eventsMap = _events.__map__ = {};
	var _event_prefix = Math.random().toString();
	var _aNode = document.createElement("a");
	var _back_urls = Path._back_urls = (history.state && history.state.back_urls) || [];
	var _forward_urls = Path._forward_urls = [];

	function _canRunEventAble(event_register, pagename) {
		var match_result = event_register.regex.exec(pagename);
		if (!match_result) {
			return false
		}
		var params = event_register.params = [];
		for (var i = 1, len = match_result.length; i < len; i += 1) {
			var val = match_result[i];
			val = ("string" == typeof val) ? decodeURIComponent(val) : val;

			var key = event_register.keys[i - 1];
			if (key) {
				params[key.name] = val;
			}
			params.push(val);
		}

		return true;
	};

	function _removeCbFromEvents(event_register, cb) {
		jSouper.$.rm(event_register.fns, cb);
		if (!event_register.fns.length) {
			delete _eventsMap[event_register.path];
			jSouper.$.rm(_events, event_register);
		}
	};
	Path.getPathname = function(pathname) {
		_aNode.href = pathname;
		pathname = _aNode.pathname;
		if (pathname.indexOf("/") !== 0) { //Fuck IE
			pathname = "/" + pathname;
		}
		return pathname;
	};
	Path.on = function(pagename, cb) {
		if (pagename instanceof Array) pagename = '(' + pagename.join('|') + ')';

		var event_register = _eventsMap.hasOwnProperty(pagename) && _eventsMap[pagename];
		if (!event_register) {
			event_register = _eventsMap[pagename] = {
				path: pagename,
				keys: [],
				fns: [],
				regex: null
			};
			event_register.regex = Path.pathToRegexp(pagename, event_register.keys, false, false);
			_events.push(event_register);

		}

		event_register.fns.push(cb);

		if (_canRunEventAble(event_register, Path._current_location.pathname)) {
			cb.call({
				path: event_register.path,
				keys: event_register.keys.slice(),
				regex: event_register.regex,
				params: event_register.params
			}, Path._current_location)
		}

		return event_register;
	};
	Path.once = function(pagename, cb) {
		function one_wrap_cb() {
			var result = cb(this, arguments);
			Path.off(pagename, cb);
			return result;
		}
		return Path.on(pagename, one_wrap_cb);
	};
	Path.emit = function(pagename) {
		jSouper.forEach(_events, function(event_register) {
			if (_canRunEventAble(event_register, pagename)) {
				var context = {
					path: event_register.path,
					keys: event_register.keys.slice(),
					regex: event_register.regex,
					params: event_register.params
				};
				jSouper.forEach(event_register.fns, function(cb) {

					cb.call(context, Path._current_location)
				});
			}
		});
	};
	Path.off = function(pagename, cb) {
		if (pagename instanceof Array) pagename = '(' + pagename.join('|') + ')';

		var event_register = _eventsMap.hasOwnProperty(pagename) && _eventsMap[pagename];
		if (event_register) {
			_removeCbFromEvents(event_register, cb);
		}
	};
	//通用跳转器
	if (_can_history_pushState) {
		Path.jump = function(href) {
			_aNode.href = href;
			if (_aNode.origin === location.origin) {
				if (_aNode.href === location.href) {
					return;
				}
				var _to_href = _aNode.href.replace(_aNode.origin, "");

				_back_urls = Path._back_urls = (history.state && history.state.back_urls) || [];
				_back_urls.push(_to_href);
				_forward_urls.length = 0;

				history.pushState({
					back_urls: _back_urls
				}, "跳转中……", _to_href);
				Path.emitDefaultOnload();
				//新页面就要跳转到起点
				window.scrollTo(0, 0);
			} else {
				location.href = href;
			}
		};
		window.addEventListener("popstate", function(e) {
			if (e.state && e.state.back_urls) {
				//后退
				if (Path._back_urls.length > e.state.back_urls.length) {
					_forward_urls.unshift.apply(_forward_urls, Path._back_urls.slice(e.state.back_urls.length));
				} else { //前进
					_forward_urls = Path._forward_urls = _forward_urls.slice(e.state.back_urls.length - Path._back_urls.length)
				}
				_back_urls = Path._back_urls = e.state.back_urls;
			} else {
				_back_urls.length = 0;
			}
		});
	} else {
		Path.jump = function(href) {
			location.href = href;
		}
	}
	//微信授权中转跳转
	Path.wxJump = function(url) {
		alert("info waiting", "努力跳转中……");
		_aNode.href = url;
		coAjax.post(appConfig.other.make_wx_short_url, {
			url: _aNode.href
		}, function(result) {
			var short_url = result.result;
			var wx_url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + wx_config.appId +
				"&redirect_uri=" + encodeURIComponent("http://api.dotnar.com/wx/authorize/notify_url") +
				"&response_type=code&scope=snsapi_userinfo&state=" + encodeURIComponent(busInfo._id + "|" + short_url) +
				"#wechat_redirect";
			location.href = wx_url;
		});
	};
	Path.setQuery = function(key, value) {
		var _current_location = Path._current_location;
		var qs = _current_location.query;
		if (value) {
			qs.set(key, value)
		} else {
			delete qs.queryHash[key];
		}
		Path.jump(qs.toString(_current_location.pathname));
	};
	Path.setHash = function(hashMap) {
		var _current_location = Path._current_location;
		var qs = _current_location.query;
		for (var key in hashMap) {
			if (hashMap.hasOwnProperty(key)) {
				var value = hashMap[key]
				if (value) {
					qs.set(key, value)
				} else {
					delete qs.queryHash[key];
				}
			}
		}
		Path.jump(qs.toString(_current_location.pathname));
	};
	Path.getQuery = function(key) {
		return Path._current_location.query.get(key);
	};
	//字符串匹配模式转化成正则表达式
	Path.pathToRegexp = function(path, keys, sensitive, strict) {
		if (path instanceof RegExp) return path;
		if (path instanceof Array) path = '(' + path.join('|') + ')';
		if (!(keys instanceof Array)) {
			strict = sensitive;
			sensitive = keys;
			keys = [];
		}
		path = path
			.concat(strict ? '' : '/?')
			.replace(/\/\(/g, '(?:/')
			.replace(/\+/g, '__plus__')
			.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
				keys.push({
					name: key,
					optional: !!optional
				});
				slash = slash || '';
				return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
			})
			.replace(/([\/.])/g, '\\$1')
			.replace(/__plus__/g, '(.+)')
			.replace(/\*/g, '(.*)');
		return new RegExp('^' + path + '$', sensitive ? '' : 'i');
	};
	//通用路由模块，与jSouper进行耦合
	Path.jSouper_VMS = {};
	Path.refreshCurrentLocation = function(href) {
		var _current_location = Path._current_location || (Path._current_location = {});
		if (_current_location.href === href) {
			return _current_location;
		}
		_aNode.href = href;

		_current_location.pathname = _aNode.pathname;
		_current_location.hash = _aNode.pathname;
		_current_location.search = _aNode.search;
		_current_location.href = _aNode.href;
		_current_location.query ?
			_current_location.query.init(_current_location.search) :
			(_current_location.query = QueryString(_current_location.search))

		return _current_location;
	};

	Path.renderDoor = function(path, options) {
		var _viewModules = Path.jSouper_VMS; //VM缓存区
		options || (options = {});
		var root_path = (options.root || "/app-pages/html") + "/";
		var tele_name = options.tel || "main"; //VM置放的锚点
		var door_file_path = root_path + path + "/@door.html";
		var current_vm = options.vm || App;

		function _teleporter_vm() {
			if (!rightVM.vm) {
				rightVM.vm = jSouper.parse(rightVM.html, door_file_path)(current_vm.getModel(), door_file_path);
			}
			current_vm.teleporter(rightVM.vm, tele_name);
		};

		var rightVM = _viewModules[door_file_path];
		var _current_page = Path._current_page;
		if (!rightVM) {
			require(["r_text!" + door_file_path], function(html) {
				_viewModules[door_file_path] = rightVM = {
					html: html
				};
				//如果在加载的期间，页面被更换了，就不执行回调
				//否则编译环境的current_localtion不正确会导致渲染问题，比如useCss，同时也能避免不必要的性能消耗
				if (_current_page == Path._current_page) {
					_teleporter_vm();
				}
			});
		} else {
			_teleporter_vm();
		}
	};

	Path.jSouperRoute = function(options) {
		var _viewModules = Path.jSouper_VMS; //VM缓存区
		var base_HTML_url = options.html = options.html || "/app-pages/html/"; //请求HTML的路径
		var base_js_url = options.js = options.js || "/app-pages/js"; //请求js文件的路径
		var base_prefix_url = options.prefix = options.prefix || ""; //URL HASH的前缀
		var tele_name = options.tel = options.tel || "main"; //VM置放的锚点
		var href = options.href = options.href;
		var current_vm = options.vm = options.vm || App;
		Path.options = options;

		var _current_location = Path.refreshCurrentLocation(href);

		var pathname = _current_location.pathname;

		if (base_prefix_url.substr(-1) !== "/") { //end with "/"
			console.warn("jSouperRoute prefix 必须以'/'结尾");
			base_prefix_url += "/";
		}
		var pagename_reg = new RegExp("^" + base_prefix_url.substr(0, base_prefix_url.length - 1) + "(/)?");

		var pagename = jSouper.$.stf(pathname.replace(pagename_reg, ""), "/") || options.default || "index"; //二级页面名
		if (options.pagename_handler instanceof Function) {
			pagename = options.pagename_handler(pagename);
		}

		//current_location
		var _current_page = Path._current_page = base_prefix_url + pagename;

		function _teleporter_vm() {
			if (!rightVM.vm) {
				rightVM.vm = jSouper.parse(rightVM.html, xmp_url)(current_vm.getModel(), xmp_url);
			}
			current_vm.teleporter(rightVM.vm, tele_name);
			options.stop_emit || Path.emit(pathname, Path._current_location);
			options.success_cb instanceof Function && options.success_cb();
		};
		var xmp_url = base_HTML_url + pagename + ".html";
		var rightVM = _viewModules[xmp_url];

		App.set("$Loc.current_location", _current_location);
		App.set("$Loc.current_page", _current_page);
		Path.setTitle(); //更改Doc-Title

		if (!rightVM) {
			openPageLoading(_current_page);
			require(["r_text!" + xmp_url], function(html) {
				_viewModules[xmp_url] = rightVM = {
					html: html
				};
				//如果在加载的期间，页面被更换了，就不执行回调
				//否则编译环境的current_localtion不正确会导致渲染问题，比如useCss，同时也能避免不必要的性能消耗
				if (_current_page == Path._current_page) {
					_teleporter_vm();
				}
				require([base_js_url + pagename + ".js"]);
				closePageLoading(_current_page);
			});
		} else {
			_teleporter_vm();
		}
	};
	//路由启动器
	Path.onload = function(loc) {
		//一级路由
		Path.jSouperRoute({
			href: loc.href,
			html: "/app-pages/html/" /*+ (_isMobile ? "mb" : "pc") + "/"*/ ,
			js: "/app-pages/js/" /*+ (_isMobile ? "mb" : "pc") + "/"*/ ,
			// css: "/app-pages/css/",
			prefix: "/", //URL-pathname中无用的前缀部分，用来过滤href得出pagename
			tel: "main",
			default: "index.html",
			pagename_handler: function(pagename) { //二次处理pagename
				return jSouper.$.lst(pagename, ".") || pagename;
			},
			index: 0,
			vm: App
		});
	};
	//默认路由触发器
	Path.emitDefaultOnload = function() {
		Path.onload({
			origin: location.origin,
			pathname: location.pathname,
			href: location.href.replace(location.origin, ""),
		});
	};
	Path.initDefaultOnload = function() {
		App.set("$Loc.back_urls", Path._back_urls);
		if (_can_history_pushState) {
			window.addEventListener("popstate", function(e) {
				App.set("$Loc.back_urls", Path._back_urls);
				Path.emitDefaultOnload();
			});
		}

		//初始化路由
		Path.emitDefaultOnload();
	};
	//注册路由
	Path.registerjSouperRoute = function(pathname, cb) {
		//Path.on被触发Path.emit，Path.jSouperRoute也会触发Path.emit，不加锁的话，可能造成死循环
		var _emit_lock_ = false;
		Path.on(pathname, function() {
			if (_emit_lock_) {
				return;
			}
			var route_options = cb.apply(this, arguments);
			if (route_options) {
				_emit_lock_ = true;
				route_options.success_cb = function() {
					_emit_lock_ = false;
				}
				Path.jSouperRoute(route_options);
			}
		});
	};
	//Document Title
	var _title_map = Path._title_map = {};
	Path.document_title = "";
	Path.setTitleMap = function(mix_title_map) {
		for (var i in mix_title_map) {
			if (mix_title_map.hasOwnProperty(i)) {
				var title_info = mix_title_map[i];
				if (typeof title_info === "string") {
					_title_map[i] = title_info;
				} else if (typeof title_info === "object") {
					if (typeof _title_map[i] === "object") { //混合模式 
						var _new_value_map = title_info.value_map;
						var _old_value_map = _title_map[i].value_map;
						for (var v in _new_value_map) {
							if (_new_value_map.hasOwnProperty(v)) {
								_old_value_map[v] = _new_value_map[v];
							}
						}
					} else if (title_info.key && title_info.value_map) { //替代模式
						_title_map[i] = {
							key: title_info.key,
							value_map: title_info.value_map
						};
					}
				}
			}
		}
		Path.setTitle();
	};
	Path.setTitle = function() {
		var _current_location = Path._current_location;

		var title_info = _title_map[Path._current_page];
		if (typeof title_info === "string") {
			Path.document_title = title_info;
		} else if (typeof title_info === "object") {
			var _val = Path.getQuery(title_info.key);
			Path.document_title = title_info.value_map[_val] || title_info.value_map["*"];
		}
		return Path.document_title;
	};

	Path.refreshCurrentLocation(location.href);

	`${ return toBrowserExpore("Path", "Path") }`
}());