//Creates cards for all articles or beatmaps in database and post them to the front page on load.

class member {
    constructor(name, bio, avatar, roles, id, perms) {
        this.name = name,
            this.bio = bio,
            this.avatar = avatar,
            this.roles = roles,
            this.id = id,
            this.perms = perms
    }

    get post() {
        var badges = '';
        var roles = JSON.parse(this.roles);
        roles.forEach(role => {
            badges += (`<p class="badge" style="color: ${this.perms[role].color};">${this.perms[role].title}</p>`);
        })

        return `
        <li class="article_post">
        <a href="/profile/?user=${this.id}" class="inner">
            <figure> 
                <img class="memberthumbnail" src="${this.avatar}?size=256" alt="avatar" onerror="if (this.src != 'https://i.imgur.com/u8Wnd4X.png') this.src = 'https://i.imgur.com/u8Wnd4X.png';">
                <figcaption>
                    <p>${this.name}</p>
                    <p>${this.bio}</i></p>
                    <div class="badges">${badges}</div>
                </figcaption>
            </figure>
        </a>
        </li>`;
    }
}

//gets a list of all articles in database on page load
var memberlist = [];
$.post("/auth/getusers", function (data) {
    $.each(data, function (i, user) {
        memberlist.push(new member(user.name, user.bio, user.avatar, user.roles, user.id, data[0].perms));
    })
    memberlist.reverse();
    console.log("Member feed retrieved.")
});

(async () => {
    console.log("Waiting for members...");
    while (memberlist.length == 0)
        await new Promise(resolve => setTimeout(resolve, 1000));

    UpdateFeed();
})();

function UpdateFeed() {
    document.querySelectorAll('.article_post').forEach(e => e.remove());
    order = document.getElementById("sorting_order").value;
    var list = memberlist;
    if (order == "new") list = memberlist;
    else if (order == "old") list = list.reverse();
    else if (order == "alphabetical") list = list.sort(sortTitle);
    else if (order == "reversealphabetical") list = list.sort(sortTitle).reverse();
    console.log(memberlist)
    $.each(list, function (i, post) {
        $(".image-list").append($(post.post));
    })
}

function sortTitle(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}