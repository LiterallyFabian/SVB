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
        var preview = this.text.slice(0, 50);

        return `
        <div class="thumb-box">
        <a href="/articles/${this.url}.html">
            <div class="thumbnailfitter"><img src="${this.thumbnailPath}" alt=""></div>
           <span class="overlay-box">
          <span class="author">${this.author}</span>
          <span class="main-title">${this.title}</span>
          <span class="description">${preview}</span>
            </span>
        </a>
      </div>`;
    }
}
$.post("/post/getposts", function (data) {
    $.each(data, function (i, post) {
        var articlez = new article(post.title, post.author, post.text, post.thumbnailPath, post.url)
        $(".gallery").append($(articlez.post));
    })
});