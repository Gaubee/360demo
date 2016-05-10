var _btoa = window.btoa;
window.btoa = function() {
	console.log("QAQ-btoa-BASE64", arguments)
	_btoa.apply(window, arguments);
};
App.set("api_root", QueryString().get('api_root') || location.origin);
require(["r_css!/css/app.css"])
require(["clipboard", "r_css!hint-css" /*, "es6!/app-pages/js/pc/apis.ts?compile_to=.js"*/
	// ,"/app-pages/js/pc/apis.bb?compile_to=.js&debug=true"
], function(Clipboard, icon_css_text) {

	function load_api() {
		var api_root = App.get("api_root");
		coAjax.get(api_root + "/apis/all", function(res) {
			App.set("$API.$Data", res)
		});
	};
	App.set("$Event.all_apis.load_api", load_api);
	App.on("api_root", load_api);
	/* 搜索API */
	function Mul_LnCS_Length(sentence, words) {

		var sLength = sentence.length;
		var result = sLength;
		var flags = new Array(sLength);
		var C = Array.from({
			length: sLength + 1
		}).map(() => Array(words[words.length - 1].length + 1));

		//int[,] C = new int[sLength + 1, words.Select(s => s.length).Max() + 1];
		for (word of words) {
			var wLength = word.length;
			var first = 0,
				last = 0;
			var i = 0,
				j = 0,
				LCS_L;
			//foreach 速度会有所提升，还可以加剪枝
			for (i = 0; i < sLength; i++)
				for (j = 0; j < wLength; j++)
					if (sentence[i] == word[j]) {
						C[i + 1][j + 1] = ~~C[i][j] + 1;
						if (first < C[i][j]) {
							last = i;
							first = C[i][j];
						}
					} else
						C[i + 1][j + 1] = Math.max(~~C[i][j + 1], ~~C[i + 1][j]);

			LCS_L = ~~C[i][j];
			if (LCS_L <= wLength >> 1)
				return -1;

			while (i > 0 && j > 0) {
				if (~~C[i - 1][j - 1] + 1 == ~~C[i][j]) {
					i--;
					j--;
					if (!flags[i]) {
						flags[i] = true;
						result--;
					}
					first = i;
				} else if (~~C[i - 1][j] == ~~C[i][j])
					i--;
				else // if (C[i, j - 1] == C[i, j])
					j--;
			}

			if (LCS_L <= (last - first + 1) >> 1)
				return -1;
		}
		// console.log(C)
		return result;
	};

	var highlight_start = Math.random().toString(16).substr(2);
	var highlight_end = Math.random().toString(16).substr(2);

	function _highlight(string) {
		return highlight_start + string + highlight_end;
	}

	function escapeRegExp(string) {
		return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	};

	function highLight(str, keys) {
		return str
			.replace(new RegExp("([" + escapeRegExp(keys) + "])", "g"), highlight_start + "$1" + highlight_end)
			.replace(new RegExp(highlight_end + highlight_start, "g"), "")
			.replace(new RegExp(highlight_start, "g"), "<hl>")
			.replace(new RegExp(highlight_end, "g"), "</hl>")
	};
	App.set("$API.$Event.search_api", function(e, vm) {
		var source_apis = vm.get("source_apis");
		if (!source_apis) { // 初始化
			source_apis = vm.get("apis");
			vm.set("source_apis", source_apis);
		}
		var search_text = jSouper.trim(vm.get("search_text")).replace(/[\[\]]/g, '').replace(/[\s]+/g, ' ');
		console.log(search_text)
		if (search_text) {
			var keys = search_text.split(/\s/);
			var needle = search_text.replace(/\s/g, '');
			var filter_api = [];
			source_apis.forEach(function(api) {
				var text = "[" + api.method + "]" + api.path + " " + (api.obj_path || (api.obj_path = path_to_obj(api.path))).replace("public_api.", "") + " " + (api.doc && api.doc.des || "");
				var weight = Mul_LnCS_Length(text, keys)
				if (weight >= 0) {
					// console.log(weight, text);
					weight = text.length - weight;
					// 克隆一份数据，进行高亮处理
					var api_with_hl = JSON.parse(JSON.stringify(api));
					api_with_hl.method = highLight(api_with_hl.method, needle);
					api_with_hl.path = highLight(api_with_hl.path, needle);
					if (api_with_hl.doc && api_with_hl.doc.des) {
						api_with_hl.doc.des = highLight(api_with_hl.doc.des, needle);
					}
					//隐藏详情
					api_with_hl.__hide_details = true;
					filter_api.push({
						w: weight,
						api: api_with_hl
					});
				}
			});
			// 根据权重排序，然后遍历出要的数组
			filter_api.sort(function(a, b) {
				return b.w - a.w
			});
			vm.set("apis", filter_api.map(function(data) {
				return data.api
			}));
		} else {
			vm.set("apis", source_apis);
		}
	});
	/* 点击隐藏/显示详情 */
	App.set("$API.$Event.toggle_details", function(e, vm) {
		vm.set("__hide_details", !vm.get("__hide_details"))
	});
	/* 点击隐藏/显示所有详情 */
	App.set("$API.$Event.toggle_all_details", function(e) {
		var api_list = [];
		var _hidden = false;
		jSouper.forEach(App.get("$API.$Data"), function(apis) {
			jSouper.forEach(apis.apis, function(api) {
				api_list.push(api);
				_hidden = _hidden || api.__hide_details;
			});
		});
		_hidden = !_hidden;
		jSouper.forEach(api_list, function(api) {
			api.__hide_details = _hidden
		});

		App.model.touchOff("$API.$Data");
	});
	/* 接口的复制 */
	function path_to_obj(path) {
		var formats = [];
		var res = path.replace(/:([^:\/]+)/g, function(matchStr, key) {
			formats.push(key)
			return "$" + key;
		});
		res = "public_api" + res.replace(/\//g, ".");
		if (formats.length) {
			res += ".format({\n" + formats.map(function(key) {
				return key + ":" + key
			}) + "\n})";
		}
		return res;
	};
	App.set("$API.$Help.path_to_obj", path_to_obj);
	new Clipboard('.copy-able-url', {
		text: function(trigger) {
			return trigger.getAttribute('data-hint');
		}
	});

	/* 图标 */
	var icons = jSouper.map(icon_css_text.match(/\.icon-[\S\-]+?:before/g), function(css_class) {
		return css_class.substr(6).replace(":before", "");
	});
	App.set("$API.$Icons", icons);
	/* 图标库的复制 */
	new Clipboard('.copy-able-icon', {
		text: function(trigger) {
			var data = trigger.getAttribute('data-hint');
			alert("success", "复制成功 " + data);
			return data;
		}
	});
});