var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require('glob');
const url = require('url');
const fetch = require('node-fetch');

//Gets users access token from auth, and then tries to log in or create account
router.get('/', (req, res) => {
    var t_info;
    const urlObj = url.parse(req.url, true);

    if (urlObj.query.code) {
        const data = {
            client_id: '793179363029549057',
            client_secret: 'KLveuO3qbqYO2feBMFfBx5iyn-sDeD8r',
            grant_type: 'authorization_code',
            redirect_uri: 'https://svt.sajber.me/auth',
            code: urlObj.query.code,
            scope: 'identify',
        };
        fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(discordRes => discordRes.json())
            .then(info => {
                t_info = info;
                console.log(info);
                return info;
            })
            .then(info => fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${info.token_type} ${info.access_token}`,
                },
            }))
            .then(userRes => userRes.json())
            .then(userdata => {
                console.log(userdata);
                if (userdata.message != "401: Unauthorized") {
                    signUpOrInUser(t_info, userdata, res)
                    var loginData = {
                        access_token: t_info.access_token,
                        id: userdata.id
                    };
                    res.cookie("auth", loginData, {
                        expires: new Date(Date.now() + 3600000 * 24 * 7)
                    });
                }
            });
    }
});

//check if users access token is valid
router.post("/verify", (req, res) => {
    var access_token = req.body.access_token;
    var id = req.body.id;
    if (!access_token || !id) return false;
    fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `Bearer ${access_token}`,
            },
        })
        .then(userRes => userRes.json())
        .then(userdata => {
            console.log(userdata);
            if (userdata.toString().includes("401: Unauthorized")) return false;
            else {
                connection.query(`SELECT * FROM users WHERE id = '${id}' and access_token = '${access_token}'`, function (err, resultmain) {
                    if (err) throw err;
                    else {
                        connection.query(`UPDATE users SET avatar = 'https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}.png' WHERE id = '${userdata.id}'`, function (err2, result) {
                            if (err2) throw err2;
                            res.send(resultmain);
                        });
                    }
                });
            }
        })
});

//get user from id
router.post("/getuser", (req, res) => {
    var id = req.body.id;
    if (!id) return false;
    connection.query(`SELECT * FROM users WHERE id = '${id}'`, function (err2, result) {
        if (err2) throw err2;
        res.send(result);
    });
});

router.post("/updateuser", (req, res) => {
    var id = req.body.id;
    var bio = req.body.bio;
    var banner = req.body.banner;
    var data = {
        bio: bio,
        banner: banner
    }
    connection.query(`UPDATE users SET ? WHERE id = '${id}'`, data, function (err2, result) {
        if (err2) throw err2;
        console.log(`User ${id} updated!`);
        res.send();
    });
})

function signUpOrInUser(data, user, res) {
    console.log(data);
    console.log(user);
    connection.query(`SELECT * FROM users WHERE id = '${user.id}'`, function (err, result) {
        if (result.length == 0) {
            console.log(`Creating user for ${user.username}#${user.discriminator}`);
            connection.query(`INSERT INTO users VALUES ('${user.username}', ${user.discriminator}, '${data.access_token}', '${data.refresh_token}', 'https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png', '${user.id}', 'Hello world!', 'https://i.imgur.com/svmBcCG.png')`, function (err2, result2) {
                if (err2) throw err2;
                res.redirect('/editprofile.html')
            });
        } else {
            //update access token
            connection.query(`UPDATE users SET avatar = 'https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png', access_token = '${data.access_token}' WHERE id = '${user.id}'`, function (err2, result2) {
                if (err2) throw err2;
                res.redirect('/profile.html?user=' + user.id)
            });
        }
    });
}

module.exports = router;
module.exports.signUpOrInUser = signUpOrInUser;