//Creates cards for all articles or beatmaps in database and post them to the front page on load.

class article {
    constructor(title, author, text, thumbnailPath, url, date) {
        this.thumbnailPath = thumbnailPath;
        this.title = title;
        this.author = author;
        this.text = text;
        this.url = url;
        this.date = date;
    }

    get post() {
        return this.generatePost();
    }

    generatePost() {
        //cut text to prevent overflowing
        var preview = shorten(stripHtml(this.text), 50);
        var disallowedEndings = [".", "!", "?", ","];
        if (!disallowedEndings.includes(preview.trim().slice(-1)) && preview.length != stripHtml(this.text).length) preview += "...";

        return `
        <li class="article_post">
        <a href="/articles/${this.url}" class="inner">
            <figure> 
                <img class="thumbnail" src="${this.thumbnailPath}" alt="thumbnail">
                <figcaption>
                    <p class="articletitle">${this.title}</p>
                    <p>${preview}</i></p>
                </figcaption>
            </figure>
        </a>
        </li>`;
    }
}

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

//gets a list of all articles in database on page load
var articlelist = [];
$.post("/post/getposts", function (data) {
    $.each(data, function (i, post) {
        articlelist.push(new article(post.title, post.author, post.text, post.thumbnailPath, post.url, post.date));
    })
    articlelist.reverse()
    console.log("Article feed retrieved.")
});

(async () => {
    console.log("Waiting for articles...");
    while (articlelist.length == 0)
        await new Promise(resolve => setTimeout(resolve, 1000));
    UpdateFeed();

})();

function UpdateFeed() {
    document.querySelectorAll('.article_post').forEach(e => e.remove());
    order = document.getElementById("sorting_order").value;
    if (order == "new") list = articlelist;
    else if (order == "old") list = articlelist.reverse();
    else if (order == "alphabetical") list = articlelist.sort(sortTitle);
    else if (order == "reversealphabetical") list = articlelist.sort(sortTitle).reverse();
    else if (order == "long") list = articlelist.sort(sortLenght).reverse();
    else if (order == "short") list = articlelist.sort(sortLenght);

    $.each(list, function (i, post) {
        $(".image-list").append($(post.post));
    })
}


function sortTitle(a, b) {
    if (a.title < b.title) {
        return -1;
    }
    if (a.title > b.title) {
        return 1;
    }
    return 0;
}

function sortLenght(a, b) {
    if (a.text.length < b.text.length) {
        return -1;
    }
    if (a.text.length > b.text.length) {
        return 1;
    }
    return 0;
}

// Shorten a string to less than maxLen characters without truncating words.
function shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) return str;
    return str.substr(0, str.lastIndexOf(separator, maxLen));
}