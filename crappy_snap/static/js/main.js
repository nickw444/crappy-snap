flashpics = ["Cheese!", "Fabulous!",];
state = 0
initial = false
// var lc = null;
var sessionID = null;
var exportBounds = {x: 0, y: 0, width: 969, height: 674};
$(document).ready(function () {
  $(window).resize();
  $('body').on('click', '#finished', function () {
    finishUp();
  });
  $('body').on('click', '#retake', function () {
    retake();
  });

  var do_snap = function () {
    state = 1
    var image = flashpics[Math.floor(Math.random() * flashpics.length)];
    sessionID = null;
    $('#controls').fadeOut('fast');
    $('#countdown').html('3');
    $('#countdown').fadeIn('fast');
    var secs = 2;

    var timer = setInterval(function () {
      $('#countdown').html(secs--);
      if (secs == -1) {
        $.ajax('/capture', {
          success: data => loadUp(data),
          error: () => loadUp(undefined)
        });
        window.setTimeout(function () {
          $('#flash').html("<p>" + image + "</p><h5>Doing some magic&hellip;</h5><img src='static/img/loading.gif'/>");
        }, 800);
        $('#flash').delay(25).fadeIn("fast");
        $('#countdown').hide();
        clearInterval(timer);
      }
    }, 1000);
  }

  $(window).bind('keyup', function (e) {

    if (initial) {
      if (state == 0) {
        // Perform a snap on keyupggg
        do_snap();
      } else if (state == 2) {
        returnBack();
      }
    }
    initial = true;
  })
  $('body').on('click', '#snap', function () {
    do_snap()
  });
});

$(window).resize(function () {
  $('#countdown').css({
    left: ($(window).width() - $('#countdown').outerWidth()) / 2,
    top: ($(window).height() - $('#countdown').outerHeight()) / 2
  });
});

function loadUp(imageData) {
  state = 2;
  if (imageData == null) {
    $('body').attr('style', 'text-align: center; color: #FFF; font-size: 48px; padding-top: 180px;');
    $('body').html("Camera battery low, camera on fire or bad focus. Please flail your arms <img class='no' src='static/img/ohno.jpg'/>");
    setInterval(function () {
      $('body').toggleClass('flashRed');
    }, 1000);
    return;
  }

  sessionID = imageData.filename;
  $("#editor").empty();
  window.setTimeout(() => {
    $("#editor").append("<img src='" + imageData.preview + "' height='100%' />");
    $("#editor").css({'background': '#000'});
    $('#editor').show();
  }, 500);

  $('#controls ul').attr('class', 'edit');
  $('#controls ul').html('<li id="retake">Try Again</li> <li id="finished">Finished! (Any Key)</li>');
  $('#controls').show();
  $('#flash').delay(2000).fadeOut("slow").delay(100);
  window.setTimeout(function () {
    $('#flash').empty();
  }, 3000);
}

function finishUp() {
  $("#editor").empty();
  returnBack();
}

function retake() {
  $.ajax({url: "/delete", type: "get", data: {i: sessionID}});
  returnBack();
}

function returnBack() {
  state = 0
  $('#controls').fadeOut('fast').delay(500).fadeIn('slow');
  window.setTimeout(function () {
    $('#controls ul').html('<li id="snap">Snap (Or Press Any Key) 📸</li>')
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
