//Creates cards for all beatmaps in database and post them to the front page on load.
class bmap {
    constructor(beatmap) {
        this.beatmap = beatmap;
    }

    generatePost(ranks) {
        var rankBadge = "";

        if (ranks)
            if (ranks[this.beatmap.title]) rankBadge = `<img class="rankOverlay" src="/img/ranking-${ranks[this.beatmap.title].toUpperCase()}.png">`;

        return `
        <li class="beatmapCard" id="card-${this.beatmap.id}">
            <figure> 
            <div class="parent">
                ${rankBadge}
                <a onClick="playPreview('${this.beatmap.path}', '${this.beatmap.id}')"> <i id="icon-${this.beatmap.id}" title="Preview song" class="fas fa-play playButton"></i></a>
                <a onclick='startID(${this.beatmap.id})' class="inner">
                <img class="thumbnail" src="/${this.beatmap.path.replace("song/", "song/icon/")}.jpg" alt="thumbnail">
                </div>
                <figcaption>
                    <p>${this.beatmap.title}</p>
                    <p>${this.beatmap.difficulty} (${secondsToDisplay(this.beatmap.length)})<br><br><i>${this.beatmap.artist}</i></p>
                </figcaption>
            </figure>
        </a>
    </li>`;
    }
}


//gets a list of all articles in database on page load
var bmaps = [];
beatmapDatabase = {};
$.post("/catch/getmaps", function (data) {
    $.each(data, function (i, map) {
        beatmapDatabase[map.id.toString()] = map;
        bmaps.push(new bmap(map));
    })
});


if (getCookie("auth").length > 0) {
    $.post("/auth/getuser", {
        auth: JSON.stringify(getAuth())
    }, function (response) {
        if (!response) {
            UpdateFeed({})
            return;
        }
        catchScores = JSON.parse(response[0].catchScores);

        UpdateFeed(catchScores.ranks ? catchScores.ranks : {});
    });
} else {
    UpdateFeed({});
}

function UpdateFeed(ranks) {
    document.querySelectorAll('.image-list .norank').forEach(e => e.remove())
    $.each(bmaps, function (i, post) {
        $(`.image-list ${ranks == {} ? ".norank" : ""}`).append($(post.generatePost(ranks)));
        document.getElementById('no-map-alert').style.display = "none";
    })


    $(function () {
        $(".beatmapCard").hover(
            function () {
                if (hoverAudio.paused) hoverAudio.play();
                else hoverAudio.currentTime = 0
            },
            function () {

            });
    });
}

//card hovering audio
var hoverAudio = new Audio('/catch/audio/hover.ogg')
hoverAudio.volume = 0.2;