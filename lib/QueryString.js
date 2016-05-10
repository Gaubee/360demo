//
/*
 * url-query解析器
 */
(function() {
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
		toString: function(origin) {
			origin || (origin = location.origin);
			var queryHash = this.queryHash || {};
			var queryStr = "";
			for (var key in queryHash) {
				if (queryHash.hasOwnProperty(key)) {
					queryStr += (key + "=" + encodeURIComponent(queryHash[key])) + "&";
				}
			}
			queryStr = queryStr.substr(0, queryStr.length - 1);
			queryStr = queryStr && ("?" + queryStr);
			var url = origin + queryStr;
			return url;
		}
	};

	`${ return toBrowserExpore("QueryString", "QueryString") }`
}());