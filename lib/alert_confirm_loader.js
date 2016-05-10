//
/*
 * 系统对话框的二次封装
 */
(function() {
	var _confirm = window.confirm;
	window.native_confirm = _confirm;
	window.confirm = window.myConfirm = window.my_confirm = function(str, true_cb, false_cb) {
		var res = _confirm(str);
		if (res) {
			true_cb && true_cb();
		} else {
			false_cb && false_cb();
		}
		return res;
	}
	var notify_color_map = {
		white: "#ffffff",
		ashen: "#d9d6c3",
		silver: "#a1a3a6",
		gray: "#555555",
		black: "#21242b",
		red: "#e51400",
		crimson: "#a20025",
		green: "#60a917",
		blue: "#00aff0",
		yellow: "#e3c800",
		yellowish: "#dec674",
		gold: "#fffcb0",
		orange: "#fa6800",
		apricot: "#fab27b",
		brownness: "#843900",
		colormoment: "#f7acbc",
		cherry: "#feeeed",
		roseous: "#f05b72",
		redplum: "#f69c9f",
		lime: "#a4c400",
		whitegreen: "#cde6c7",
		inst: "#90d7ec",
		cyan: "#1ba1e2",
		emerald: "#008a00",
		teal: "#00aba9",
		cobalt: "#0050ef",
		indigo: "#6a00ff",
		violet: "#aa00ff",
		pink: "#dc4fad",
		magenta: "#d80073",
		amber: "#f0a30a",
		brown: "#825a2c",
		olive: "#6d8764",
		steel: "#647687",
		mauve: "#76608a",
		taupe: "#87794e",
		dark: "#333333",
		darker: "#222222",
		darkBrown: "#63362f",
		darkCrimson: "#640024",
		darkMagenta: "#81003c",
		darkIndigo: "#4b0096",
		darkCyan: "#1b6eae",
		darkCobalt: "#00356a",
		darkTeal: "#004050",
		darkEmerald: "#003e00",
		darkGreen: "#128023",
		darkOrange: "#bf5a15",
		darkRed: "#9a1616",
		darkPink: "#9a165a",
		darkViolet: "#57169a",
		darkBlue: "#16499a",
		lightBlue: "#4390df",
		lightRed: "#ff2d19",
		lightGreen: "#7ad61d",
		lighterBlue: "#00ccff",
		lightTeal: "#45fffd",
		lightOlive: "#78aa1c",
		lightOrange: "#c29008",
		lightPink: "#f472d0",
		grayDark: "#333333",
		grayDarker: "#222222",
		grayLight: "#999999",
		grayLighter: "#eeeeee",
		ink: "#464547",
		error: "#a20025",
		warn: "#fa6800",
		success: "#60a917",
		info: "#1ba1e2",
		lightWhite: "#f6f5ec"
	};
	window.native_alert = window.alert;
	window.alert = window.myAlert = window.my_alert = function(type, alert_str) {
		var args = arguments;
		var result;
		if (args.length === 1) {
			alert_str = type;
			if (typeof alert_str === "string") {
				result = $.Notify.show(alert_str);
			} else {
				result = $.Notify(alert_str);
			}
		} else if (args.length >= 2) {
			var time = (args[2] === undefined) ? 3000 : args[2];
			if (typeof type === "object") {
				var className = type.className;
				var css_style = type.style;
			} else {
				var type_info = type.split(" ");
				var class_color = notify_color_map[type_info.shift()];
				var css_style = {
					background: class_color,
					color: "white"
				};
				var className = type_info.join(" ");
			}
			require(["jQuery.notify"], function() {
				result = $.Notify({
					style: css_style,
					className: className,
					content: alert_str,
					timeout: time
				});
			});
		}
		return result;
	};
	var $pageLoader = $("#pageLoader");
	var _page_load_lock = {};
	window.openPageLoading = function(key) {
		if (key) {
			_page_load_lock[key] = true;
		}
		$pageLoader.removeClass("hidden");
	};

	window.closePageLoading = function(key) {
		if (key) {
			delete _page_load_lock[key];
		}
		if (Object.keys(_page_load_lock).length == 0) {
			$pageLoader.addClass("hidden");
		}
	};
}());