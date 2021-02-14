class member {
    constructor(id, username, avatar, hasClaim, reactPower, reactCost, lastAction) {
        this.id = id,
            this.username = username,
            this.avatar = avatar,
            this.hasClaim = hasClaim,
            this.reactPower = reactPower,
            this.reactCost = reactCost,
            this.lastAction = lastAction
    }

    get post() {
        return `
        <li class="article_post">
        <a href="/profile/?user=${this.id}" class="inner">
            <figure> 
                <img class="memberthumbnail" src="https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png?size=512" alt="avatar" onerror="if (this.src != 'https://i.imgur.com/u8Wnd4X.png') this.src = 'https://i.imgur.com/u8Wnd4X.png';">
                <figcaption>
                    <p>${this.username}</p>
                    <div class="badges">
                        <p class="badge" style="color: ${this.hasClaim == 1 ? "#05fe05" : "#ff5b5b"};">${this.hasClaim == 1 ? "HAS CLAIM" : "CLAIMED"}</p>
                        <p class="badge" style="color: ${this.reactPower >= this.reactCost ? "#05fe05" : "#ff5b5b"};">POWER: ${this.reactPower}%</p>
                    </div>
                </figcaption>
            </figure>
        </a>
        </li>`;
    }
}

//gets a list of all articles in database on page load
var memberlist = [];

function UpdateFeed() {
    $.post("/mudae/users", function (data) {
        memberlist = [];
        $.each(data, function (i, user) {
            memberlist.push(new member(user.id, user.username, user.avatar, user.hasClaim, user.reactPower, user.reactCost, user.lastAction));
        })
        memberlist.reverse();


        document.querySelectorAll('.article_post').forEach(e => e.remove());

        var list = memberlist.sort(sortTime).reverse();
        $.each(list, function (i, user) {
            $(".image-list").append($(user.post));
        })
    });
}


function sortTime(a, b) {
    if (a.lastAction < b.lastAction) {
        return -1;
    }
    if (a.lastAction > b.lastAction) {
        return 1;
    }
    return 0;
}

window.setInterval(function () {
    UpdateFeed();
    setDate()
}, 120000);

$(document).ready(function () {
    UpdateFeed();
})
var nextReset
setDate()

function setDate() {
    nextReset = new Date();
    var hour = nextReset.getHours();
    var minute = nextReset.getMinutes();

    if (hour % 3 == 0 && minute >= 20) nextReset.setHours(hour + 3);
    if (hour % 3 == 0 && minute < 20) nextReset.setHours(hour);
    else nextReset.setHours(hour + 3 - hour % 3);
    nextReset.setMinutes(20);
    nextReset.setSeconds(0);
}

var x = setInterval(function () {
    var now = new Date().getTime();
    var distance = nextReset - now;

    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("resetCountdown").innerHTML = `Claim reset in <b><br>${hours}h ${minutes}m ${seconds}s</b>`

    if (distance < 0) {
        clearInterval(x);
        document.getElementById("resetCountdown").innerHTML = "Oh man, oh man. Where are all the rolls?<br>‎";
        confetti.start();
    }
}, 1000);