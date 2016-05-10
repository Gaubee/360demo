//
(function() {
	/*
	 * 数据解析工具
	 */
	function default_err_handle(errorMsg, data, xhr) {
		console.error("coAjax Error:", errorMsg);
		my_alert("error", errorMsg);
	};
	var dataFormat = function(success, error) {
		error || (error = default_err_handle);
		return function(data, textStatus, jqXHR) {
			if (!data.info && typeof data.toString === "string") { // 老版本的兼容写法
				data.info = data.toString;
				try {
					data.info = JSON.parse(data.toString)
				} catch (e) {}
			}
			switch (data.type) {
				case "string":
					// data.result = data.toString;
					arguments[0] = data.info;
					success.apply(this, arguments);
					break;
				case "json":
					arguments[0] = data.info;
					success.apply(this, arguments);
					break;
				case "html":
					// data.result = jQuery(data.toString);
					arguments[0] = jQuery(data.info);
					success.apply(this, arguments);
					break;
				case "template":
					data.result = jSouper.parse(data.info);
					success.apply(this, arguments);
					break;
				case "error":
					// data.error = result;
					result = data.info;
					error.call(this, result.errorMsg, result, jqXHR, data)
					break;
				default: //JSON without error
					arguments[0] = data.info;
					success.apply(this, arguments);
					break;
			}
		};
	};

	`${ return toBrowserExpore("dataFormat", "dataFormat") }`


	/*
	 * 解析Object成urlencoded，进行POST发送
	 */
	var stringifyPrimitive = function(v) {
		if (typeof v === 'string')
			return v;
		if (typeof v === 'number' && isFinite(v))
			return '' + v;
		if (typeof v === 'boolean')
			return v ? 'true' : 'false';
		return '';
	};

	function object_to_urlencoded(obj, sep, eq, options) {
		sep = sep || '&';
		eq = eq || '=';

		var encode = encodeURIComponent;
		if (options && typeof options.encodeURIComponent === 'function') {
			encode = options.encodeURIComponent;
		}

		if (obj !== null && typeof obj === 'object') {
			var keys = Object.keys(obj);
			var len = keys.length;
			var flast = len - 1;
			var fields = '';
			for (var i = 0; i < len; ++i) {
				var k = keys[i];
				var v = obj[k];
				var ks = encode(stringifyPrimitive(k)) + eq;

				if (Array.isArray(v)) {
					var vlen = v.length;
					var vlast = vlen - 1;
					for (var j = 0; j < vlen; ++j) {
						fields += ks + encode(stringifyPrimitive(v[j]));
						if (j < vlast)
							fields += sep;
					}
					if (vlen && i < flast)
						fields += sep;
				} else {
					fields += ks + encode(stringifyPrimitive(v));
					if (i < flast)
						fields += sep;
				}
			}
			return fields;
		}
		return '';
	};
	/*
	 * 生成XHR并发送
	 */
	function sendXHR(options) {
		var xhr = new(window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");
		//进度条功能
		if (options.progress) {
			if (xhr instanceof window.XMLHttpRequest) {
				xhr.addEventListener('progress', options.progress, false);
			}

			if (xhr.upload) {
				xhr.upload.addEventListener('progress', options.progress, false);
			}
		}
		var yield_id = 0;
		//QG框架一条请求的通讯
		xhr.addEventListener("readystatechange", function() {
			if (xhr.responseText) {
				var yield_info = xhr.responseText.split(/\[YIELD\-URL\]\((.+?)\)/);
				if (yield_info.length > yield_id * 2 + 1) {
					console.log(xhr.responseText)
					if (!self.dataFilter) {
						self.dataFilter = function(data) {
							var res_text = data.split(/\[YIELD\-URL\]\((.+?)\)/).pop();
							try {
								return JSON.parse(res_text)
							} catch (e) {
								return {
									type: "error",
									info: {
										errorMsg: e.message,
										errorObj: e
									}
								}
							}
						}
					}
					var yield_url = yield_info[2 * yield_id + 1];
					var yield_json = yield_info[2 * yield_id];
					yield_id += 1;
					try {
						var yield_data = JSON.parse(yield_json);
						var send_yield_task = function(err, value) {
							console.log("YIELD SEND:", yield_url, res);

							sendXHR({
								method: "POST",
								url: yield_url,
								xhrFields: {
									withCredentials: true
								},
								contentType: "application/x-www-form-urlencoded",
								data: {
									type: err ? "error" : "success",
									value: err || value
								},
								complete: function(resText) {
									if (resText === "Success") {
										console.log("数据发送成功", yield_url, arguments)
									} else {
										console.error("数据发送失败", yield_url, arguments)
									}
								}
							});
						};
						var yieldHandles = options.yieldHandles || {};
						switch (yield_data.handle) {
							case "prompt":
								if (yieldHandles.hasOwnProperty(yield_data.handle) && yieldHandles[yield_data.handle] instanceof Function) {
									yieldHandles[yield_data.handle](yield_data.title, yield_data.default_value, send_yield_task);
								} else {
									var res = window.prompt(yield_data.title, yield_data.default_value);
									send_yield_task(null, res)
								}
								break;
							default:
								if (yieldHandles[yield_data.handle] instanceof Function) {
									yieldHandles[yield_data.handle](yield_data, send_yield_task);
								} else {
									console.error("No Found yield Handle: [" + yield_data.handle + "]")
								}
						}

					} catch (e) {
						options.error("yield parse error", e, xhr)
					}
				}
			}
		});
		xhr.addEventListener("readystatechange", function() {
			if (xhr.readyState === 4 && yield_id === 0) {
				if (xhr.status === 200 && options.success instanceof Function) {
					try {
						var data = JSON.parse(xhr.responseText);
					} catch (e) {
						console.error("JSON PARSE ERROR:", e);
					}
				}
				if (data) {
					options.success(data, xhr.status, xhr)
				} else {
					options.error instanceof Function &&
						options.error(xhr)
				}
				options.complete instanceof Function && options.complete(xhr.responseText, xhr.status, xhr)
			}
		});


		xhr.open((options.method || "get").toUpperCase(), options.url, true);
		var contentType = options.contentType || "";
		contentType && xhr.setRequestHeader("Content-type", contentType);
		if (contentType.indexOf("urlencoded") !== -1) {
			xhr.send(options.data && object_to_urlencoded(options.data));
		} else if (contentType.indexOf("json") !== -1) {
			xhr.send(options.data && JSON.stringify(options.data));
		} else {
			xhr.send(options.data);
		}
		return xhr;
	};

	/*
	 * 基于跨域ajax工具函数
	 */

	var ajax = {
		_addCookiesInUrl: function(url) {
			// if(url.indexOf("?")==-1){
			// 	url+="?"
			// }else{
			// 	url+="&"
			// }
			// url += "cors_cookie="+encodeURI(document.cookie);
			return url;
		},
		_ajax: function(url, method, data, success, error, net_error) {
			var options = {
				url: url,
				method: method,
				contentType: "application/x-www-form-urlencoded",
				data: data,
				success: dataFormat(success, error),
				error: net_error || function(xhr) {
					try {
						if (xhr.status === 502) {
							var data = xhr.responseJSON;
							(error || default_err_handle)(data.info.errorMsg, data.info, xhr)
						} else {
							(error || default_err_handle)(xhr.status, null, xhr)
						}
					} catch (e) {
						(error || default_err_handle)(e.stack || e.message, e, xhr)
					}
				},
				progress: function(event) {
					_xhr.emit("progress", event);
					if (event.loaded == event.total) {
						//释放内存
						eventManager.clear("progress" + _event_prefix);
					}
				},
				xhrFields: {
					withCredentials: true
				},
				yieldHandles: {

				}
			};
			var _xhr = sendXHR(options);
			var _event_prefix = Math.random();
			//事件机制，目前支持progress
			_xhr.on = function(eventName) {
				eventName += _event_prefix;
				arguments[0] = eventName;
				return eventManager.on.apply(eventManager, arguments);
			};
			_xhr.emit = function(eventName) {
				eventName += _event_prefix;
				arguments[0] = eventName;
				return eventManager.fire.apply(eventManager, arguments);
			};
			return _xhr;
		},
		get: function(url, data, success, error, net_error) {
			url = ajax._addCookiesInUrl(url);
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			return ajax._ajax(url, "get", data, success, error, net_error);
		},
		post: function(url, data, success, error, net_error) {
			url = ajax._addCookiesInUrl(url);
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			return ajax._ajax(url, "post", data, success, error, net_error);
		},
		put: function(url, data, success, error, net_error) {
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			url = ajax._addCookiesInUrl(url);
			return ajax._ajax(url, "put", data, success, error, net_error);
		},
		"delete": function(url, data, success, error, net_error) {
			url = ajax._addCookiesInUrl(url);
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			return ajax._ajax(url, "delete", data, success, error, net_error);
		}
	};
	var coAjax = ajax;

	`${ return toBrowserExpore("coAjax", "coAjax") }`

	/*
	 * 基于SockJS的web-sock通讯
	 */
	var conns = {};
	var serverNotify = function _init_sock(type, event_cache, _is_cover) {
		type || (type = "user"); //默认是user类型
		if (conns[type] && !_is_cover) { //同类型只能有一个sock连接
			return conns[type];
		}
		event_cache || (event_cache = {});
		var exports = {
			_send_queue: function() {
				for (var i = 0, data; data = _send_queue[i]; i += 1) {
					sock.send(JSON.stringify(data));
				}
				_send_queue = [];
			},
			send: function(type, value) {
				// if (arguments.length == 1) {
				// 	value = type;
				// }
				var data = {
					type: type,
					value: value
				};
				_send_queue.push(data);
				if (_is_opened) {
					this._send_queue();
				}
			},
			on: function(eventName, fun) {
				var event_col = event_cache[eventName] || (event_cache[eventName] = []);
				event_col.push(fun);
			},
			off: function(eventName) {
				event_cache[eventName] = [];
			},
			emit: function(eventName, value) {
				var event_col = event_cache[eventName];
				if (event_col) {
					event_col.forEach(function(fun) {
						fun(value);
					});
				}
			}
		};
		var sock = new SockJS(appConfig.socketNotify);
		var _is_opened = false;
		var _send_queue = [];
		sock.onopen = function() {
			console.log('+Sock 连接已经打开');
			_is_opened = true;
			exports._send_queue();
			//获取连接密匙
			console.log("Sock 获取协议密匙");
			coAjax.post(appConfig.socketNotify_key, {
				type: type
			}, function(result) {
				console.log("Sock 密匙获取成功，申请通讯权限");
				var s_key = result.result.s_key;
				exports.send("init", {
					s_key: s_key
				});
				exports.on("init-success", function() {
					console.log("Sock 申请通讯权限申请成功");
				});
				exports.on("init-error", function(errorMsg) {
					console.error(errorMsg);
				});
			});
		};
		var data_handle = dataFormat(function(result) {
			exports.emit(result.type, result.result);
		}, function(errorCode, xhr, errorMsg, result) {
			exports.emit(result.type + "-error", result.toString);
		});
		sock.onmessage = function(e) {
			console.log('message', e.data);
			try {
				var data = JSON.parse(e.data);
				data_handle(data);
			} catch (e) {
				console.error(e);
				exports.emit("error", e.data);
			}
		};
		sock.onclose = function() {
			// console.log('close');
			console.log('-Sock 连接已经断开');
			exports.off("init-success");
			exports.off("init-error");
			setTimeout(function() {
				_init_sock(type, event_cache, true);
			}, 500); //半秒后进行重连
		};
		return (conns[type] = exports);
	};

	`${ return toBrowserExpore("serverNotify", "serverNotify") }`

	/*
	 * 封装的滚动监听功能
	 */
	require(["eventManager"], function(eventManager) {
		var self = $(window);
		var _top = 0;
		var _event_name = Math.random().toString(32) + "|scroll";
		self.scroll(function(e) {
			var _current_top = self.scrollTop()
			e.lastscrollTop = _top;
			e.scrollTop = _current_top;
			e.deltaY = _current_top - _top;
			_top = _current_top;
			eventManager.emit(_event_name, e)
		});
		window.listenScroll = function listenScroll(foo) {
			eventManager.on(_event_name, foo);
		};

		`${ return toBrowserExpore("listenScroll", "listenScroll") }`
	});

}());