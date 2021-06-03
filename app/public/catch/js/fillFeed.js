//Creates cards for all beatmaps in database and post them to the front page on load.
class bmap {
    constructor(beatmap) {
        this.beatmap = beatmap;
    };

    generatePost() {
        //set rank overlay
        var rankOverlay = ``;
        var score = catchScores[this.beatmap.id];
        if (score) rankOverlay = `<img class="rankOverlay" src="/img/ranking-${score.rank.toUpperCase()}.png">`;

        var stars = "";
        for (var i = 0; i < Math.round(this.beatmap.stars); i++) stars += `<i class="fas fa-star star"></i>`;

        var fixedTitle = this.beatmap.title.replace(/(?<!^)(\[.+\]$)|(\(.+\)$)|(\-.+\-$)|(\~.+\~$)|((feat|ft| ver ).+)|(\/|\-.+remix)$/ig, '');

        return `
        <li class="beatmapCard" id="card-${this.beatmap.id}">
            <figure> 
            <div class="parent">
                ${rankOverlay}
                <a onClick="playPreview('${this.beatmap.path}', '${this.beatmap.id}')"> <i id="icon-${this.beatmap.id}" title="Preview song" class="fas fa-play playButton"></i></a>
                <a onclick='startID(${this.beatmap.id})' class="inner">
                <img class="thumbnail" src="/${this.beatmap.path.replace("song/", "song/icon/")}.jpg" alt="thumbnail">
                </div>
                <figcaption>
                    <p style="padding-bottom:2px"><b>${fixedTitle}</b></p>
                    <p>${this.beatmap.difficulty} (${secondsToDisplay(this.beatmap.length)})</p>
                    <br>
                    <div class="starContainer">${this.beatmap.stars.toFixed(2)} ${stars}</div>
                </figcaption> 
            </figure>
        </a>
    </li>`;
    }
}


beatmapDatabase = {};
allBeatmaps = [];
catchScores = {};
includedIDs = [];

var sort = getAloneCookie("sort");
//set default if no sorting is saved
if (typeof sort == "object") {
    sort = {
        sort: "difficulty",
        reverse: false
    };
    setCookie("sort", JSON.stringify(sort), 100000);
} else {
    sort = JSON.parse(sort);
}

axios.all([
        axios.post("/catch/getmaps"),
        axios.post("/auth/getuser", {
            auth: getCookie("auth").length > 0 ? JSON.stringify(getAuth()) : -1
        })
    ])
    .then(axios.spread((maps, user) => {
        if (user.data) catchScores = JSON.parse(user.data[0].catchScores).ranks;
        if (typeof catchScores == 'undefined') catchScores = {};
        $.each(maps.data, function (i, map) {
            beatmapDatabase[map.id.toString()] = map;
            map.tags += ` ${map.title} ${map.creator} ${map.difficulty} ${map.artist}`;
            allBeatmaps.push(map);
        });
        matches = allBeatmaps;
        FillFeed();
        document.getElementById('no-map-alert').style.display = "none";
        $(function () {
            $(".beatmapCard").hover(
                function () {
                    if (hoverAudio.paused) hoverAudio.play();
                    else hoverAudio.currentTime = 0
                },
                function () {

                });
        });
    }));

//card hovering audio
var hoverAudio = new Audio('/catch/audio/hover.ogg')
hoverAudio.volume = 0.2;


$(document).ready(function () {
    var typingTimer;
    var doneTypingInterval = 200;
    var input = $('#search');
    input.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(Search, doneTypingInterval);
    });

    input.on('keydown', function () {
        clearTimeout(typingTimer);
    });

    $(`#sort-${sort.sort}`).addClass(sort.reverse ? "fa-chevron-down" : "fa-chevron-up")
});


function Search() {
    var search = $("#search").val().toLowerCase();
    var searches = search.split(" ").filter(String);
    var regex = GenerateRegExp(searches);
    var matches = allBeatmaps.filter((i) => {
        const r = new RegExp(regex, 'gi');
        return r.test(i.tags);
    });
    includedIDs = [];
    matches.forEach(m => includedIDs.push(m.id))
    $(".beatmapCard").each(function () {
        var thisID = $(this)[0].id.replace("card-", "");
        if (includedIDs.includes(parseInt(thisID))) $(this).removeClass("hide")
        else $(this).addClass("hide")
    })
}

function GenerateRegExp(arr) {
    var s = ".*";
    arr.forEach(function (e) {
        s += "(?=.*" + EscapeRegExp(e) + ")";
    });
    return s += ".*";
}

function EscapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function FillFeed() {
    //sort
    if (sort.sort == "difficulty") allBeatmaps.sort((a, b) => (a.stars > b.stars) ? 1 : -1);
    if (sort.sort == "title") allBeatmaps.sort(function (a, b) {
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });
    if (sort.sort == "artist") allBeatmaps.sort(function (a, b) {
        return a.artist.toLowerCase().localeCompare(b.artist.toLowerCase());
    });
    if (sort.sort == "length") allBeatmaps.sort((a, b) => (a.length > b.length) ? 1 : -1);
    if (sort.sort == "bpm") allBeatmaps.sort((a, b) => (a.bpm > b.bpm) ? 1 : -1);
    if (sort.reverse) allBeatmaps.reverse();

    $('.beatmapCard').remove();
    allBeatmaps.forEach(map => {
        $(`.image-list`).append($(new bmap(map).generatePost()));
    })
}

function SetSort(newSort) {
    $(`#sort-${sort.sort}`).removeClass("fa-chevron-down fa-chevron-up")
    if (sort.sort == newSort) {
        sort.reverse = !sort.reverse;

    } else {
        sort.sort = newSort;
        sort.reverse = false;
    }
    setCookie("sort", JSON.stringify(sort), 100000);
    $(`#sort-${newSort}`).addClass(sort.reverse ? "fa-chevron-down" : "fa-chevron-up")
    FillFeed();
}