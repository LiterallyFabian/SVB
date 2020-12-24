//Creates cards for all articles in database and post them to the front page on load.

class article {
    constructor(title, author, text, thumbnailPath, url) {
        this.thumbnailPath = thumbnailPath;
        this.title = title;
        this.author = author;
        this.text = text;
        this.url = url;
    }

    get post() {
        return this.generatePost();
    }

    generatePost() {
        //cut text to prevent overflowing
        var preview = shorten(stripHtml(this.text), 50)
        

        return `
        <li>
    <a href="/articles/${this.url}.html" class="inner">
      <div class="li-img">
        <img src="${this.thumbnailPath}" alt="thumbnail" />
      </div>
      <div class="li-text">
        <h3 class="li-head">${this.title}</h3>
        <div class="li-sub">
          <p>${preview}</p>
        </div>
      </div>
    </a>
  </li>`;
    }
}

$.post("/post/getposts", function (data) {
    $.each(data, function (i, post) {
        var articles = new article(post.title, post.author, post.text, post.thumbnailPath, post.url)
        $(".img-list").append($(articles.post));
    })
});

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function endsWithAny(suffixes, string) {
    for (let suffix of suffixes) {
        if (string.endsWith(suffix))
            return true;
    }
    return false;
}

// Shorten a string to less than maxLen characters without truncating words.
function shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) return str;
    return str.substr(0, str.lastIndexOf(separator, maxLen));
  }