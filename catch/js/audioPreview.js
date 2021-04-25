var previewAudio;
var playHash = 0;

function playPreview(path, id) {

    //play audio
    if (document.getElementById(id).classList.contains('fa-play')) {

        var x = document.getElementsByClassName('fa-pause');
        for (var i = 0; i < x.length; i++) {
            setIcon(x[i], false);
        }

        if (previewAudio) {
            stopPreview();
        }

        previewAudio = new Audio(`/${path.replace("song/", "song/preview/")}.mp3`);
        previewAudio.volume = 0;
        $(previewAudio).animate({
            volume: document.getElementById("musicRange").value / 100
        }, 500);
        previewAudio.play();
        setIcon(document.getElementById(id), true);

        playHash = randomInRange(0, 10000);
        var tempHash = playHash;

        setTimeout(function () {
            if (tempHash == playHash) stopPreview();
        }, 9400);


    }
    //stop audio
    else {
        stopPreview()
        setIcon(document.getElementById(id), false);
    }
}

function setIcon(element, pause) {
    if (pause) {
        element.classList.remove('fa-play');
        element.classList.add('fa-pause');
    } else {
        element.classList.remove('fa-pause');
        element.classList.add('fa-play');
    }
}

function stopPreview() {
    $(previewAudio).animate({
        volume: 0
    }, 500);
}