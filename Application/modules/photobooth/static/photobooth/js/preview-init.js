window.addEventListener("DOMContentLoaded", function() {
	var preview = document.getElementById("preview");
	var previewObj = { "video": true };
	errBack = function(error) { console.log("The webcam fucked up! (", error.code + ")"); };
	
	if(navigator.getUserMedia) {
		navigator.getUserMedia(previewObj, function(stream) {
			preview.src = stream;
			preview.play();
		}, errBack);
	
	} else if(navigator.webkitGetUserMedia) {
		navigator.webkitGetUserMedia(previewObj, function(stream){
			preview.src = window.webkitURL.createObjectURL(stream);
			preview.play();
		}, errBack);
	
	} else if(navigator.mozGetUserMedia) {
		navigator.mozGetUserMedia(previewObj, function(stream){
			preview.src = window.URL.createObjectURL(stream);
			preview.play();
		}, errBack);
	}
}, false);
