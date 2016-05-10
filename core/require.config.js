// var _isMobile = function(_mobileAgent) {
// 	var mobileAgent = _mobileAgent || ["nokia", "iphone", "android", "motorola", "^mot-", "softbank", "foma", "docomo", "kddi", "up.browser", "up.link", "htc", "dopod", "blazer", "netfront", "helio", "hosin", "huawei", "novarra", "CoolPad", "webos", "techfaith", "palmsource", "blackberry", "alcatel", "amoi", "ktouch", "nexian", "samsung", "^sam-", "s[cg]h", "^lge", "ericsson", "philips", "sagem", "wellcom", "bunjalloo", "maui", "symbian", "smartphone", "midp", "wap", "phone", "windows ce", "iemobile", "^spice", "^bird", "^zte-", "longcos", "pantech", "gionee", "^sie-", "portalmmm", "jigs browser", "hiptop", "^benq", "haier", "^lct", "operas*mobi", "opera*mini", "mobile", "blackberry", "IEMobile", "Windows Phone", "webos", "incognito", "webmate", "bada", "nokia", "lg", "ucweb", "skyfire", "ucbrowser"];
// 	var browser = navigator.userAgent.toLowerCase();
// 	var isMobile = false;
// 	for (var i = 0; i < mobileAgent.length; i++) {
// 		if (browser.indexOf(mobileAgent[i]) != -1) {
// 			isMobile = true;
// 			break;
// 		}
// 	}
// 	return isMobile;
// }();
var _isMobile = function(_mobileAgent) {
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
}(); 
var _isWX = (/MicroMessenger/i).test(window.navigator.userAgent);

requireConfig = appConfig = {
	// api_base_url: "http://127.0.0.1:4100/",
	img_server_url: "http://o6wfv42ht.bkt.clouddn.com/",
	// baseUrl: "./",
	waitSeconds: 0,
	paths: {
		"r_css": "/lib/require.css.v3",
		"r_text": "/lib/require.text3",
		"es6": "/node_modules/requirejs-babel/es6",
		"babel": "/node_modules/requirejs-babel/babel-5.8.22.min",

		/* JS */
		"jQuery": "/lib/jquery-1.12.2.min",
		"jQuery.notify": "/lib/jquery.notify",
		"jQuery.qrcode":"/lib/jquery.qrcode-0.11.0.min",
		"moment": "/lib/moment.min",
		"moment-locale-zh-cn": "/lib/moment.locale.zh-cn",
		"jSouper": "/lib/jSouper.min",
		"lrz": _isMobile ? "/lib/lrz.mobile.min" : "/lib/lrz.pc.min",
		"clipboard": "/lib/clipboard.min",
		"co":"/babel_lib/co.js?min=true",

		/* CSS */
		"hint-css": "/css/src/hint",
		"metro-rtl-css": "/css/src/metro-rtl",

		/* APP */
		"app": "/lib/app"
	},
	shim: {
		"app": {
			deps: ["jQuery"]
		},
		"jQuery.notify": {
			deps: ["jQuery"],
			init: function() {
				require(["r_css!" + "/lib/css/jquery.notify"])
			}
		},
		"moment-locale-zh-cn": {
			deps: ["moment"]
		}
	}
};
require.config(requireConfig);