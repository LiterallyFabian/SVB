class article {
    constructor(neg, author, text, thumbnailPath, url) {
        this.thumbnailPath = thumbnailPath;
        this.title = neg;
        this.author = author;
        this.text = text;
        this.url = url;
    }

    get post() {
        return this.generatePost();
    }

    generatePost() {
        console.log(this);
        //cut text to prevent overflowing
        var preview = this.text.slice(0, 50);

        return `
        <div class="thumbnail"> <img src="${this.thumbnailPath}" alt="" width="2000" class="cards" /></a>
        <a href="/articles/${this.url}.html">
          <h4>${this.author}</h4>
          <p class="title">${this.title}</p>
          <p class="text_column">${preview}</p>
      </div></a>`;
    }
}
$.post( "/getposts", function( data ) {
    $.each(data, function(i, post){
        var articlez = new article(post.title, post.author, post.text, post.thumbnailPath, post.url)
        console.log(articlez.post)
        $( ".gallery" ).append( $(articlez.post) );
    })
  });