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
    connection.query(`SELECT * FROM posts WHERE url = '${url}'`, function (err, result) {
        console.log("a");
        if (result.length == 0) {
            console.log(`Creating news article ${title}, by ${author}`);
            connection.query(`INSERT INTO posts VALUES ('${title}', '${author}', '${text}', '${thumbnail}', '${url}', '${date}')`, function (err2, result) {
                if (err2) throw err2;
                res.send(result);
                console.log("Post created!");
                createPosts()
            });
        } else {
            connection.query(`UPDATE posts SET title = '${title}', author = '${author}', text = '${text}', thumbnailPath = '${thumbnail}', date = '${date}' WHERE url = '${url}'`, function (err2, result) {
                if (err2) throw err2;
                res.send(result);
                console.log("Post Updated!");
                createPosts()
            });
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
    connection.query(`DELETE FROM posts WHERE url = '${url}'`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
            console.log(`Deleted article ${url}`)
        }
    });
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
            var article = post.text.replace("\n", "<br>");
            var publishdate = new Date(post.date);
            var publishtext = `${publishdate.getDate()} ${months[publishdate.getMonth()]} ${publishdate.getFullYear()}`;
            var file = data
                .replace("{{title}}", post.title)
                .replace("{{author}}", post.author)
                .replace("{{image}}", post.thumbnailPath)
                .replace("{{article}}", article)
                .replace("{{url}}", post.url)
                .replace("{{date}}", publishtext)
            fs.writeFile(`articles/${post.url}.html`, file, function (err) {
                if (err) return console.log(err);
            });
        }));
    });
}

module.exports = router;
module.exports.createPosts = createPosts;