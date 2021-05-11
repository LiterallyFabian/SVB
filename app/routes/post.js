var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');

//create news article, or updates if URL already exists
router.post('/createpost', (req, res) => {
    var title = req.body.title;
    var author = req.body.author;
    var text = req.body.text;
    var thumbnail = req.body.thumbnailPath;
    var url = req.body.url.replace(/\//g, "");
    var date = req.body.date;
    var auth = req.body.auth;

    verifyPermission(auth, "modify_articles").then(granted => {
        if (granted) {
            connection.query(`SELECT * FROM posts WHERE url = '${url}'`, function (err, result) {
                if (result.length == 0) {
                    console.log(`Creating news article ${title}, by ${author}`);
                    connection.query(`INSERT INTO posts VALUES ('${title}', '${author}', '${text}', '${thumbnail}', '${url}', '${date}', '${auth.id}')`, function (err2, result) {
                        if (err2) throw err2;
                        res.send(result);
                        console.log("Post created!");
                        createPosts();
                    });
                } else {
                    connection.query(`UPDATE posts SET title = '${title}', text = '${text}', thumbnailPath = '${thumbnail}', date = '${date}' WHERE url = '${url}'`, function (err2, result) {
                        if (err2) throw err2;
                        res.send(result);
                        console.log("Post Updated!");
                        createPosts();
                    });
                }
            });
        } else {
            res.send(false);
        }
    });
});

//Gets all articles
router.post('/getposts', (req, res) => {
    connection.query("SELECT * FROM posts", function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

//Gets an article from url
router.post('/getarticle', (req, res) => {
    var url = req.body.url;
    connection.query(`SELECT * FROM posts WHERE url = '${url}'`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

//Deletes an article from url
router.post('/deletearticle', (req, res) => {
    var url = req.body.url;
    var auth = req.body.auth;
    verifyPermission(auth, "delete_articles").then(granted => {
        if (granted) {
            connection.query(`DELETE FROM posts WHERE url = '${url}'`, function (err, result) {
                if (err) throw err;
                else {
                    res.send(result);
                    console.log(`Deleted article ${url}`)
                }
            });
        } else {
            res.send(false);
        }
    })

});


//Creates html files for all articles
function createPosts() {
    connection.query("SELECT * FROM posts", function (err, result, fields) {
        if (err) throw err;
        var months = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
        console.log(`Creating ${result.length} news articles...`)
        result.forEach(post => fs.readFile("posttemplate.html", 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            //Create article text and fix new lines in it
            var article = post.text;

            //Add images to article
            var imageregex = /img([0-9]{1,3})\((https?:\/\/.*\.(?:png|jpg))\)/gi;
            article = article.replace(imageregex, `<div class="article_image"><img src="$2" alt="Image" style="width: $1%"></div>`)

            //Set variables on html page
            var publishdate = new Date(post.date);
            var publishtext = `${publishdate.getDate()} ${months[publishdate.getMonth()]} ${publishdate.getFullYear()}`;
            var file = data
                .replace(/{{title}}/g, post.title)
                .replace(/{{author}}/g, `<a href="/profile?user=${post.id}">${post.author}</a>`)
                .replace(/{{image}}/g, post.thumbnailPath)
                .replace(/{{article}}/g, article)
                .replace(/{{url}}/g, post.url)
                .replace(/{{date}}/g, publishtext)
                .replace(/{{preview}}/g, shortenContent(article, 35))

            //Save article as html page

            fs.writeFile(`public/articles/${post.url}.html`, file, function (err) {
                if (err) return console.log(err);


            });
        }));
    });
}

function shortenContent(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) return str;
    return str.substr(0, str.lastIndexOf(separator, maxLen));
}

module.exports = router;
module.exports.createPosts = createPosts;