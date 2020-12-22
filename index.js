console.log(`Welcome to SVT!`)
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2');
const path = require('path');
const fs = require('fs');
const app = express();
const months = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];
app.use(express.static(path.join(__dirname, '')));
// Setup database connection parameter
let connection = mysql2.createConnection({
    host: 'localhost',
    user: 'fabian',
    password: 'priya',
    database: 'svt'
});

// Connect with the database
connection.connect(function (e) {
    if (e) {

        // Show error messaage on failure
        return console.error('error: ' + e.message);
    }

    // Show success message if connected
    console.log('\nConnected to the MySQL server\n');

    if (e) throw e;
    connection.query("SELECT * FROM users", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });

    createPosts();
});



function createPosts() {
    connection.query("SELECT * FROM posts", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
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

app.use(express.json());
app.use(express.static("/"));
app.use(bodyParser.urlencoded({
    extended: false
}))

app.get('/', (req, res) => {
    res.sendFile('/home/fabian/svt/index.html')
});

//login
app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    connection.query(`SELECT * FROM users WHERE name = '${username}' AND hash = '${password}'`, function (err, result) {
        if (err) throw err;
        console.log(`Trying to login user ${username}`);
        if (result.length > 0) {
            var user = {
                username: username,
                password: password
            }
            res.cookie("login", user, {
                expires: new Date(Date.now() + 3600000 * 24 * 7)
            });
            res.cookie("isLoggedin", true, {
                expires: new Date(Date.now() + 3600000 * 24 * 7)
            });
            res.send(result);
        } else {
            res.send("No such user<br>" + username);
        }
    });
});


//register new user
app.post('/register', (req, res) => {

    var username = req.body.username;
    var password = req.body.password;
    var note = req.body.message;
    connection.query(`SELECT * FROM users WHERE name = '${username}'`, function (err, result) {
        if (result.length == 0) {
            console.log(`Creating user ${username}, hash ${password}`);
            connection.query(`INSERT INTO users VALUES ('${username}', '${password}')`, function (err2, result2) {
                if (err2) throw err2;
                res.send(result);
            });
        } else {
            res.send(result);
        }
    });
});

//create news article, or updates if URL already exists
app.post('/createpost', (req, res) => {
    console.log("post!");
    var title = req.body.title;
    var author = req.body.author;
    var text = req.body.text;
    var thumbnail = req.body.thumbnailPath;
    var url = req.body.url.replace("/", "");
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

app.post('/getposts', (req, res) => {
    connection.query("SELECT * FROM posts", function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

app.post('/getarticle', (req, res) => {
    var url = req.body.url;
    connection.query(`SELECT * FROM posts WHERE url = '${url}'`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

app.post('/deletearticle', (req, res) => {
    var url = req.body.url;
    connection.query(`DELETE FROM posts WHERE url = '${url}'`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
            console.log(`Deleted article ${url}`)
        }
    });
});



const hostname = '192.168.56.101';
const port = 3000;

const server = http.createServer(app);


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});