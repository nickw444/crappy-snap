flashpics = ["Cheese!","Fabulous!","Gorgeous!","Wow!","Fantastic!","Awesome!","Impressive!"];
state = 0
initial = false
// var lc = null;
var sessionID = null;
var exportBounds = {x: 0, y: 0, width: 969, height: 674};
$(document).ready(function () {
	$(window).resize();
	$('body').on('click', '#finished', function() { finishUp(); });
	$('body').on('click', '#retake', function() { retake(); });

	var do_snap = function() {
		state = 1
		var image = flashpics[Math.floor(Math.random()*flashpics.length)];
		sessionID = null;
		$('#controls').fadeOut('fast');
		$('#countdown').html('3');
		$('#countdown').fadeIn('fast');
		var secs = 2;

		var timer = setInterval(function() { 
			$('#countdown').html(secs--);
			if (secs == -1) {$.get( "/capture", function( data ) { loadUp(data); });			
				window.setTimeout(function() {
				$('#flash').html("<p>" + image + "</p><h5>Doing some magic&hellip;</h5><img src='resources/photobooth/img/loading.gif'/>");
				}, 800);
				$('#flash').delay(25).fadeIn("fast");
				$('#countdown').hide();
				clearInterval(timer);
			}
		}, 1000);
	}

	$(window).bind('keyup', function(e) {
		
		if (initial) {
			if (state == 0) {
				// Perform a snap on keyupggg
				do_snap();
			}
			else if (state == 2) {
				returnBack();
			}
		}
		initial = true;
	})
	$('body').on('click', '#snap', function() {
		do_snap()
	});
});

$(window).resize(function(){
	$('#countdown').css({
		left: ($(window).width() - $('#countdown').outerWidth())/2,
		top: ($(window).height() - $('#countdown').outerHeight())/2
	});
});

function loadUp(imageTag) {
//	sessionID = '123456';
	state = 2
	sessionID = imageTag;
	if (imageTag == "") { 
		$('body').attr('style', 'text-align: center; color: #FFF; font-size: 48px; padding-top: 180px;');
		$('body').html("Camera battery low, camera on fire or bad focus. Please flail your arms <img class='no' src='img/ohno.jpg'/>");
		// $('#controls ul').attr('class','edit');
		// $('#controls ul').html('<li id="retake"><i class="fa fa-refresh"></i> Try Again</li> <li id="finished">Finished! (Any Key) <i class="fa fa-thumbs-o-up"></li>');
		// $('#controls').show();
		setInterval(function() {
			$('body').toggleClass('flashRed');
			}, 1000);
		return;
	}
//	var imageURL = "booth/originals/1417666582.jpg";
	var imageURL = "static/captures/" + imageTag;
	$("#editor").empty();
	$("#editor").append("<img src='" + imageURL +"' width='100%' />");
	$("#editor").css({'background': '#000'})
	$('#editor').show();

	// var wm = new Image();
	// wm.src = imageURL;
	$('#controls ul').attr('class','edit');
	$('#controls ul').html('<li id="retake"><i class="fa fa-refresh"></i> Try Again</li> <li id="finished">Finished! (Any Key) <i class="fa fa-thumbs-o-up"></li>');
	$('#controls').show();
	// $('#editor').
	// lc = LC.init(document.getElementById('editor'), { 
	// 	imageSize: {width: 969, height: 800},
	// 	watermarkImage: wm,
	// 	watermarkScale: 0.4, 
	// 	imageURLPrefix: 'img/canvas',
	// 	tools: [ LC.tools.Pencil, LC.tools.Eraser, LC.tools.Rectangle, LC.tools.Ellipse],
	// 	primaryColor: '#FFD700',
	// 	backgroundColor: '#000000',
	// 	keyboardShortcuts: false
	// });
	$('#flash').delay(2000).fadeOut("slow").delay(100);
	window.setTimeout(function() {
		$('#flash').empty();
	}, 3000);
}

function finishUp() {
	// completedImage = lc.getImage({rect: exportBounds}).toDataURL();
	// $.ajax({type: "POST", url: "/store", data: {image: completedImage, filename: sessionID + '.png'}
	// 	}).done(function(response) { showDone(); });
	returnBack();
}

function retake() {
		$.ajax({ url: "/delete", type: "get", data: {i: sessionID}});
		returnBack();
}
function returnBack() {
		state = 0
		$('#controls').fadeOut('fast').delay(500).fadeIn('slow');
		window.setTimeout(function() { 
		$('#controls ul').html('<li id="snap">Snap (Or Press Any Key) <i class="fa fa-camera-retro"></i></li>')
		}, 500);
                // $('#editor').fadeOut('slow');
		$('#editor').empty();
		$('#editor').hide();
		// lc = null;
                var secs = 3;
		var sessionID = null;
}

function showDone() {
	$('#finmsg').fadeIn('slow').delay(4000).fadeOut('slow');


}
