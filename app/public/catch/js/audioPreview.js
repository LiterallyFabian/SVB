/*
Handles audio previews on beatmap cards
*/

var previewAudio;
var playHash = 0;

function playPreview(path, id) {
    var iconID = `icon-${id}`;
    var cardID = `card-${id}`;

    //play audio
    if (document.getElementById(iconID).classList.contains('fa-play')) {

        var x = document.getElementsByClassName('fa-pause');
        for (var i = 0; i < x.length; i++) {
            setIcon(x[i].id.replace("icon-", ""), false);
        }

        if (previewAudio) {
            stopPreview();
        }

        previewAudio = new Audio(`/${path.replace("song/", "song/preview/")}.mp3`);
        previewAudio.volume = 0;
        var goalVolume = getAloneCookie("catchVolumeMusic");
        if (goalVolume == null) goalVolume = 50;
        $(previewAudio).animate({
            volume: goalVolume / 100
        }, 500);
        previewAudio.play();
        setIcon(id, true);

        playHash = randomInRange(0, 10000);
        var tempHash = playHash;

        setTimeout(function () {
            if (tempHash == playHash) {
                stopPreview();
                setIcon(id, false);
            }
        }, 9400);


    }
    //stop audio
    else {
        stopPreview()
        setIcon(id, false);
    }
}

function setIcon(id, pause) {
    var iconElement = document.getElementById(`icon-${id}`);
    var cardElement = document.getElementById(`card-${id}`);

    if (pause) {
        iconElement.classList.remove('fa-play');
        iconElement.classList.add('fa-pause');
        cardElement.classList.add('song-active');
        cardElement.style.animation = `pulse ${60/beatmapDatabase[id.toString()].bpm}s infinite`;
        cardElement.classList.remove('song-deactive');
    } else {
        iconElement.classList.remove('fa-pause');
        iconElement.classList.add('fa-play');
        cardElement.classList.remove('song-active');
        cardElement.style.removeProperty("animation");
        cardElement.classList.add('song-deactive');
    }
}

function stopPreview() {
    $(previewAudio).animate({
        volume: 0
    }, 500);
}

$(document).on('keyup', function (e) {
    if (e.key == "Escape") stopPreview();
});