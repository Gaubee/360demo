require(["lib/three.min", "lib/photo-sphere-viewer"], function() {
	var img_url = Path.getQuery("img_url");
	if (!img_url) {
		alert("error", "参数错误");
	}
	window.PSV = new PhotoSphereViewer({
		// Path to the panorama
		panorama: img_url,

		// Container
		container: document.getElementById("container"),

		// Deactivate the animation
		time_anim: false,

		// Display the navigation bar
		navbar: true,

		// Resize the panorama
		size: {
			width: '100%',
			height: '100%'
		}
	});

});