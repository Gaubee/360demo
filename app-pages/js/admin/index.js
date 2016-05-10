App.set("to_quanjing_short_url", function() {
	var url = App.get("upload_image_url");
	var img_url = location.origin + "/show.html?img_url=" + encodeURIComponent(url);
	alert("短链接生成中……");
	coAjax.post(public_api.quanjing360.s.build, {
		url: img_url
	}, function(result) {
		var s_url = public_api.quanjing360.s.$hash.format({
			hash: result
		});
		App.set("res_url", s_url);
		alert("success", "生成成功");
	});
});