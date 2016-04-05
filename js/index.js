var imgs = ["street.jpg", "sun.jpg", "snow.jpg"]
var qs = {}
location.search.substr(1).split("&").forEach(function(data) {
	var info = data.split("=");
	qs[info[0]] = info[1]
});
var PSV = new PhotoSphereViewer({
	// Path to the panorama
	panorama: imgs[~~qs.img % imgs.length],

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
var DTextNode = document.getElementById("d-info");
var MTextNode = document.getElementById("m-info");

// window.addEventListener("deviceorientation", function(e) {
// 	// console.log("F:",
// 	// 	e.absolute,
// 	// 	e.alpha,
// 	// 	e.beta,
// 	// 	e.gamma,
// 	// 	"--"
// 	// );

// 	DTextNode.innerHTML = e.alpha + "<br>" +
// 		e.beta + "<br>" +
// 		e.gamma + "<br>"
// }, false);

// window.addEventListener("devicemotion", function(e) {
// 	// console.log("M:",
// 	// 	e.acceleration,
// 	// 	e.accelerationIncludingGravity,
// 	// 	e.rotationRate,
// 	// 	e.interval,
// 	// 	"--"
// 	// );


// 	MTextNode.innerHTML = JSON.stringify(e.acceleration) + "<br>" +
// 		JSON.stringify(e.accelerationIncludingGravity) + "<br>" +
// 		JSON.stringify(e.rotationRate) + "<br>" +
// 		e.interval + "<br>"
// }, false)