//Creates cards for all beatmaps in database and post them to the front page on load.

class bmap {
    constructor(id, title, artist, difficulty, thumbnail, length, creator) {
        this.id = id,
        this.title = title,
        this.artist = artist,
        this.difficulty = difficulty,
        this.thumbnail = thumbnail,
        this.length = length,
        this.creator = creator
    }

    get post() {
        return this.generatePost();
    }

    generatePost() {
        return `
        <li class="article_post">
    <a href='#' onclick='startGame("${this.thumbnail.replace("jpg", "osu").replace("png", "osu")}", "${this.thumbnail}", "${this.thumbnail.replace("jpg", "mp3").replace("png", "mp3")}")' class="inner">
      <div class="li-img">
        <img src="/${this.thumbnail}" alt="thumbnail" />
      </div>
      <div class="li-text">
        <h3 class="li-head">${this.artist} - ${this.title}</h3>
        <div class="li-sub">
          <p>${this.difficulty} (${secondsToDisplay(this.length)})<br><br>Mapped by ${this.creator}</p>
        </div>
      </div>
    </a>
  </li>`;
    }
}


//gets a list of all articles in database on page load
var bmaps = [];
$.post("/catch/getmaps", function (data) {
    $.each(data, function (i, post) {
        bmaps.push(new bmap(post.id, post.title, post.artist, post.difficulty, post.thumbnail, post.length, post.creator));
    })
    bmaps.reverse()
});

function UpdateFeed() {
    $.each(bmaps, function (i, post) {
        $(".img-list").append($(post.post));
    })
}

function secondsToDisplay(duration)
{   
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

window.onload = function () {
    UpdateFeed();
};