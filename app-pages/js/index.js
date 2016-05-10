App.set("body", {
	height: "480px",
	width: "350px",
});
var imgs = [{
	name: "街道",
	src: "images/street.jpg",
}, {
	name: "阳光",
	src: "images/sun.jpg",
}, {
	name: "雪景",
	src: "images/snow.jpg",
}, ];
App.set("imgs", imgs);
require(["lib/three.min", "lib/photo-sphere-viewer"], function() {
	window.PSV = new PhotoSphereViewer({
		// Path to the panorama
		panorama: imgs[~~Path.getQuery("img") % imgs.length].src,

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