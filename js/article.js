class article {
    constructor(title, author, text, thumbnailPath, url) {
        this.thumbnailPath = thumbnailPath;
        this.title = title;
        this.author = author;
        this.text = text;
        this.url = url;
    }

    get post() {
        return this.GeneratePost();
    }

    generatePost() {
        //cut text to prevent overflowing
        var preview = this.text.slice(0, 160);

        return `
        <div class="thumbnail"> <img src="${this.thumbnailPath}" alt="" width="2000" class="cards" /></a>
        <a href="${this.url}.html">
          <h4>${this.author}</h4>
          <p class="title">${this.title}</p>
          <p class="text_column">${preview}</p>
      </div></a>`;
    }
}