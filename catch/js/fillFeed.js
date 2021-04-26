//Creates cards for all beatmaps in database and post them to the front page on load.
class bmap {
    constructor(id, title, artist, difficulty, path, length, creator) {
        this.id = id,
            this.title = title.trim().toString(),
            this.artist = artist,
            this.difficulty = difficulty,
            this.path = path,
            this.length = length,
            this.creator = creator
    }

    generatePost(ranks) {
        var rankBadge = "";
        var songID = `preview-${this.title.replace(" ", "-").replace("'", "´")}`

        if (ranks)
            if (ranks[this.title]) rankBadge = `<img class="rankOverlay" src="/img/ranking-${ranks[this.title].toUpperCase()}.png">`;

        return `
        <li class="beatmapCard">
            <figure> 
            <div class="parent">
                ${rankBadge}
                <a onClick="playPreview('${this.path}', '${songID}')"> <i id="${songID}" title="Preview song" class="fas fa-play playButton"></i></a>
                <a onclick='startGame("${this.path}", "${this.title.trim().replace("'", "´")}")' class="inner">
                <img class="thumbnail" src="/${this.path.replace("song/", "song/icon/")}.jpg" alt="thumbnail">
                </div>
                <figcaption>
                    <p>${this.title}</p>
                    <p>${this.difficulty} (${secondsToDisplay(this.length)})<br><br><i>${this.artist}</i></p>
                </figcaption>
            </figure>
        </a>
    </li>`;
    }
}


//gets a list of all articles in database on page load
var bmaps = [];
$.post("/catch/getmaps", function (data) {
    $.each(data, function (i, post) {
        bmaps.push(new bmap(post.id, post.title, post.artist, post.difficulty, post.path, post.length, post.creator));
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