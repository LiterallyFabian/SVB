//Creates cards for all beatmaps in database and post them to the front page on load.

class bmap {
    constructor(id, title, artist, difficulty, path, length, creator) {
        this.id = id,
            this.title = title,
            this.artist = artist,
            this.difficulty = difficulty,
            this.path = path,
            this.length = length,
            this.creator = creator
    }

    get post() {
        return this.generatePost();
    }

    generatePost() {
        return `
        <li>
        <a href='#'
            onclick='startGame("${this.path}", "${this.title.trim().replace("'", "´")}")'
            class="inner">
            <figure> 
                <img class="thumbnail" src="/${this.path}_icon.jpg" alt="thumbnail">
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

function UpdateFeed() {
    $.each(bmaps, function (i, post) {
        $(".image-list").append($(post.post));
    })
}

window.onload = function () {
    UpdateFeed();
};