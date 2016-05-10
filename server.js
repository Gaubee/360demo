const jhs = require("jhs");
const path = require("path");
jhs.options.root = [__dirname];
jhs.options.index = "index.html";
jhs.options.router_file = "@door.html";
const $404_lock = Symbol("404");

// html 404
const app_pages_path = path.normalize("/app-pages/html/");
jhs.on("status:404", co.wrap(function*(file_paths, res_pathname, type, pathname, params, req, res) {
	if (res.file_info.extname === ".html" && !req[$404_lock]) {
		req[$404_lock] = true;
		const res_pathname_with_app_pages_path = app_pages_path + res_pathname;
		console.log(res_pathname_with_app_pages_path)
		if (res_pathname.indexOf(app_pages_path) !== 0
			/*&&
			// 如果在app-pages目录下找得到，那就说明Ajax没问题，返回index.html
			(yield jhs.fss.existsFileInPathsMutilAsync(file_paths, res_pathname_with_app_pages_path))
		*/
		) {
			console.log(res_pathname_with_app_pages_path)
			yield jhs.emit_filter(app_pages_path + jhs.options.router_file, req, res)
		}
	}
}));
const port = 8145;
jhs.listen(port, function() {
	console.log("文件服务已启动:", port);
});