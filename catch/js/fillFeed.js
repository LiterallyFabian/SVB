//Creates cards for all beatmaps in database and post them to the front page on load.
class bmap {
    constructor(id, title, artist, difficulty, path, length, creator) {
        this.id = id,
            this.title = title.trim(),
            this.artist = artist,
            this.difficulty = difficulty,
            this.path = path,
            this.length = length,
            this.creator = creator
    }

    generatePost(ranks) {
        var rankBadge = "";
        if (ranks[this.title]) rankBadge = `<img class="rankOverlay" src="/img/ranking-${ranks[this.title].toUpperCase()}.png">`;
        return `
        <li>
        <a href='#'
            onclick='startGame("${this.path}", "${this.title.trim().replace("'", "´")}")'
            class="inner">
            <figure> 
            <div class="parent">
                ${rankBadge}
                <img class="thumbnail" src="/${this.path}_icon.jpg" alt="thumbnail">
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
        auth: getCookie("auth")
    }, function (data) {
        catchScores = JSON.parse(data[0].catchScores);
        console.log(catchScores.ranks);
        UpdateFeed(catchScores.ranks);
    });
}else{
    UpdateFeed({});
}

function UpdateFeed(ranks) {
    document.querySelectorAll('.image-list .norank').forEach(e => e.remove())

    $.each(bmaps, function (i, post) {
        $(`.image-list ${ranks == {} ? ".norank" : ""}`).append($(post.generatePost(ranks)));
    })
}