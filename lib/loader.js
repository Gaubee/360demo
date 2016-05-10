(function() {

	function loader_noop() {};
	var _end_add;
	var loader_id = "pageLoader";

	window._removeLoader = function() {
		$loaderDiv = $("#" + loader_id);
		$loaderDiv.stop().animate({
			opacity: 0
		}, 400, function() {
			$loaderDiv.remove();
		});
		document.getElementById("jSouperApp").style.display = "block";
		console.log("程序开始运行");
		_end_add = true;
		window.removeLoader = loader_noop;
		window.showLoader = _showLoader;
	};

	function _add_loader() {
		if (_end_add) {
			return;
		}
		//加入loaderHTML

	};

	function While(obj, key, cb) {
		if (obj[key]) {
			cb()
		} else {
			var __ti = setInterval(function() {
				if (obj[key]) {
					cb();
					clearInterval(__ti);
				}
			}, 10);
		}
	}
	While(document, "body", _add_loader);

	window.removeLoader = function() {
		While(window, "_removeLoader", function() {
			_removeLoader();
		});
	};
	window.showLoader = loader_noop;

	function _showLoader() {
		$loaderDiv.stop().css("opacity", 1).appendTo(document.body);
		window.removeLoader = window._removeLoader;
		window.showLoader = loader_noop;
	};
}());