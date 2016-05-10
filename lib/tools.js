var isMobile = function(_mobileAgent) {
	var mobileAgent = _mobileAgent || ["nokia", "iphone", "android", "motorola", "^mot-", "softbank", "foma", "docomo", "kddi", "up.browser", "up.link", "htc", "dopod", "blazer", "netfront", "helio", "hosin", "huawei", "novarra", "CoolPad", "webos", "techfaith", "palmsource", "blackberry", "alcatel", "amoi", "ktouch", "nexian", "samsung", "^sam-", "s[cg]h", "^lge", "ericsson", "philips", "sagem", "wellcom", "bunjalloo", "maui", "symbian", "smartphone", "midp", "wap", "phone", "windows ce", "iemobile", "^spice", "^bird", "^zte-", "longcos", "pantech", "gionee", "^sie-", "portalmmm", "jigs browser", "hiptop", "^benq", "haier", "^lct", "operas*mobi", "opera*mini", "mobile", "blackberry", "IEMobile", "Windows Phone", "webos", "incognito", "webmate", "bada", "nokia", "lg", "ucweb", "skyfire", "ucbrowser"];
	var browser = navigator.userAgent.toLowerCase();
	var isMobile = false;
	for (var i = 0; i < mobileAgent.length; i++) {
		if (browser.indexOf(mobileAgent[i]) != -1) {
			isMobile = true;
			break;
		}
	}
	return isMobile;
};
var _isMobile = isMobile();
var _isWX = (/MicroMessenger/i).test(window.navigator.userAgent);
/*
 * QueryString
 */
function QueryString(url) {
	if (!(this instanceof QueryString)) {
		return new QueryString(url)
	}
	this.init(url);
};
QueryString.prototype = {
	init: function(url) {
		url || (url = location.search);
		var queryStr = url.substr(url.indexOf("?") + 1);
		this._init_queryStr(queryStr);
	},
	_init_queryStr: function(queryStr) {
		var queryList = queryStr.split("&");
		var queryHash = {};
		for (var i = 0, queryInfo, len = queryList.length; i < len; i += 1) {
			if (queryInfo = queryList[i]) {
				queryInfo = queryInfo.split("=");
				if (queryInfo[1]) {
					queryHash[queryInfo[0]] = decodeURIComponent(queryInfo[1]);
				}
			}
		}
		this.queryHash = queryHash;
	},
	get: function(key) {
		var queryHash = this.queryHash || {};
		return queryHash[key];
	},
	set: function(key, value) {
		var queryHash = this.queryHash || (this.queryHash = {});
		queryHash[key] = value;
	},
	toSting: function(origin) {
		origin || (origin = location.origin);
		var queryHash = this.queryHash || {};
		var queryStr = "";
		for (var key in queryHash) {
			if (queryHash.hasOwnProperty(key)) {
				queryStr += (key + "=" + encodeURIComponent(queryHash[key]));
			}
		}
		var url = origin + "?" + queryStr;
	}
}


/*
 * hash_routie
 */

function hash_routie(config) {
	var base_HTML_url = config.html_url;
	var base_js_url = config.js_url;
	var common_hash = config.hash_prefix;
	var default_hash = config.default_hash;
	var tele_name = config.teleporter;

	/*
	 * HASH路由
	 */
	var _viewModules = {};

	function _routie_common(key) {
		key = hash_routie.get_pathname(key);
		jSouper.ready(function() {
			if (!key) {
				return;
			}
			hash_routie._current_key = key;
			hash_routie._current_path = location.hash.split("#")[1] || "";
			config.before_handle && config.before_handle(key, _viewModules);

			var rightVM = _viewModules[key];

			if (!rightVM) {
				var xmp_url = base_HTML_url + key + ".html";
				showLoader(); //样式表可能已经切换，避免丑陋画面出现
				$.get(xmp_url, function(html) {
					_viewModules[key] = rightVM = jSouper.parse(html, xmp_url)(App.getModel());
					App.teleporter(rightVM, tele_name);
					removeLoader();
				});
				$.getScript([base_js_url + key + ".js"]);
			} else {
				App.teleporter(rightVM, tele_name);
				hash_routie.emit(key);
				hash_routie.emit("*");
			}
		});

	};
	var routie_config = {};
	routie_config[common_hash] = _routie_common;
	if (default_hash) {
		routie_config["*"] = function(hash) {
			var key = hash_routie.get_pathname(hash);
			if (!key) {
				_routie_common(key || default_hash);
			}
		}
	}
	routie(routie_config);
}
_on = {};
hash_routie.on = function(key, cb) {
	_on[key] = cb;
	(hash_routie._current_key == key || key === "*") && cb(key);
};
hash_routie.emit = function(key) {
	var cb = _on[key];
	cb && cb(key);
};
hash_routie.get_pathname = function(hash) {
	var index = hash.indexOf("?")
	if (index !== -1) { //如果有参数，过滤参数
		var indexHash = hash.indexOf("#"); //有时候#会在?前面
		if (indexHash !== -1) {
			index = Math.min(indexHash, index);
		}
		hash = hash.substring(0, index);
	}
	return hash;
};
hash_routie.get_search = function(hash) {
	var index = hash.indexOf("?")
	if (index !== -1) { //如果有参数，过滤参数
		hash = hash.substr(index + 1);
	}
	return hash;
};
hash_routie.hash = function(hashMap, clear) {
	if (!clear) {
		var queryString = new QueryString(location.hash);
		var queryHash = queryString.queryHash;
		//和原有HASH变量进行混合
		for (var key in queryHash) {
			if (queryHash.hasOwnProperty(key) && !hashMap.hasOwnProperty(key)) {
				hashMap[key] = queryHash[key];
			}
		}
	}
	var hash_str = "";
	for (var key in hashMap) {
		if (hashMap.hasOwnProperty(key)) {
			hash_str += "&" + key + "=" + encodeURIComponent(hashMap[key]);
		}
	}
	hash_str = hash_str.replace("&", "?");
	location.hash = hash_routie.get_pathname(location.hash.substr(1)) + hash_str;
};