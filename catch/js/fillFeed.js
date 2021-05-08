//Creates cards for all beatmaps in database and post them to the front page on load.
class bmap {
    constructor(beatmap) {
        this.beatmap = beatmap;
    }

    generatePost() {
        return `
        <li class="beatmapCard" id="card-${this.beatmap.id}">
            <figure> 
            <div class="parent">
            <img class="rankOverlay" id="rank-${this.beatmap.id}">
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
    UpdateFeed();
});

catchScores = {}
if (getCookie("auth").length > 0) {
    $.post("/auth/getuser", {
        auth: JSON.stringify(getAuth())
    }, function (response) {
        if (response) {
             catchScores = JSON.parse(response[0].catchScores).ranks;
            $.each(catchScores, function (i, score) {
                if (score.id) $(`#rank-${score.id}`).attr("src", `/img/ranking-${score.rank.toUpperCase()}.png`);
            })
        }
    });
}

function UpdateFeed() {
    $.each(bmaps, function (i, post) {
        $(`.image-list`).append($(post.generatePost()));
        if (bmaps.length > 0) document.getElementById('no-map-alert').style.display = "none";
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