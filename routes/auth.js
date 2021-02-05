var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require('glob');
const url = require('url');
const fetch = require('node-fetch');
const permissions = require("./permission.js");
const perms = permissions.permissions;

//Gets users access token from auth, and then tries to log in or create account
router.get('/', (req, res) => {
    var t_info;
    const urlObj = url.parse(req.url, true);

    if (urlObj.query.code) {
        const data = {
            client_id: '793179363029549057',
            client_secret: process.env.client_secret,
            grant_type: 'authorization_code',
            redirect_uri: process.env.redirect_uri,
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
                //console.log(info);
                return info;
            })
            .then(info => fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${info.token_type} ${info.access_token}`,
                },
            }))
            .then(userRes => userRes.json())
            .then(userdata => {
                //console.log(userdata);
                if (userdata.message != "401: Unauthorized") {
                    signUpOrInUser(t_info, userdata, res)
                    var loginData = {
                        access_token: t_info.access_token,
                        id: userdata.id,
                        name: userdata.username
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
    var auth = req.body.auth;

    if (!access_token || !id) return false;
    fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `Bearer ${access_token}`,
            },
        })
        .then(userRes => userRes.json())
        .then(userdata => {
            //console.log(userdata);
            if (userdata.toString().includes("401: Unauthorized")) return false;
            else {
                connection.query(`SELECT * FROM users WHERE id = '${id}' and access_token = '${access_token}'`, function (err, resultmain) {
                    if (err) throw err;
                    else {
                        connection.query(`UPDATE users SET avatar = 'https://cdn.discordapp.com/avatars/${userdata.id}/${userdata.avatar}.png' WHERE id = '${userdata.id}'`, function (err2, result) {
                            if (err2) throw err2;
                            verifyPermission(auth, "modify_articles").then(granted => {
                                if (granted) resultmain[0]["canPost"] = true;
                                else resultmain[0]["canPost"] = false;
                                res.send(resultmain);
                            });
                        });
                    }
                });
            }
        })
});

//get public userdata from id
router.post("/getuser", (req, res) => {
    var id = req.body.id;
    var auth = req.body.auth;
    if (!id) return [];
    connection.query(`SELECT * FROM users WHERE id = '${id}'`, function (err2, result) {
        if (err2) throw err2;
        if (result.length > 0) {
            result[0].perms = perms; //add copy of perm system

            //remove private data
            result[0].access_token = "";
            result[0].refresh_token = "";

            verifyPermission(auth, "assign_roles").then(granted => {
                if (granted) result[0]["canAssignRoles"] = true;
                else result[0]["canAssignRoles"] = false;
                res.send(result);
            });
        } else {
            res.send(false);
        }
    });
});

router.post("/updateuser", (req, res) => {
    var id = req.body.id;
    var auth = req.body.auth;
    var data = {
        bio: req.body.bio,
        banner: req.body.banner
    }
    var roles = JSON.stringify(req.body.roles).toLowerCase();

    verifyPermission(auth, "update_allProfile").then(granted => { //user got permission to edit any profile
        if (granted) {
            connection.query(`UPDATE users SET ? WHERE id = '${id}'`, data, function (err2, result) {
                if (err2) throw err2;
                console.log(`User ${id} updated by admin ${auth.id}!`);
                res.send(true);
                return;
            });
        } else {
            verifyPermission(auth, "update_ownProfile").then(granted => { //user got permission to edit their profile
                if (granted && id == auth.id) { // user tries to update profile with their ID
                    connection.query(`SELECT * FROM users WHERE id = '${auth.id}' AND access_token = '${auth.access_token}'`, function (err, result) {
                        if (result.length > 0) { // user found with same access ID; user now authorized 
                            connection.query(`UPDATE users SET ? WHERE id = '${id}'`, data, function (err2, result) {
                                if (err2) throw err2;
                                console.log(`User profile ${id} updated by themselves!`);
                                res.send(true);
                                return;
                            });
                        }
                    });
                } else {
                    res.send(false);
                }
            });
        }
    });

    //try to update user roles
    verifyPermission(auth, "assign_roles").then(granted => { //user got permission to assign ALL roles to EVERYONE
        if (granted) {
            connection.query(`UPDATE users SET roles = '${roles}' WHERE id = '${id}'`, function (err2, result) {
                if (err2) throw err2;
                console.log(`User ${id} roles updated by admin ${auth.id}! New roles: ${roles}`);
            });
        }
    })
})

//adds bananas and rank to user profile after game
router.post("/updatecatch", (req, res) => {
    var rank = req.body.rank;
    var bananasCatched = req.body.bananasCatched;
    var bananasSeen = req.body.bananasSeen;
    var id = req.body.id;
    var score = req.body.score;
    var highestCombo = req.body.highestCombo;
    if (!id) return false;
    connection.query(`SELECT * FROM users WHERE id = '${id}'`, function (err2, result) {
        var data = JSON.parse(result[0].catchScores);
        data.bananasSeen += bananasSeen;
        data.bananasCatched += bananasCatched;
        if (data.score == null) data.score = 0;
        data.score += score;
        if (data.highestCombo == null) data.highestCombo = 0;
        if (highestCombo > data.highestCombo) data.highestCombo = highestCombo;
        switch (rank) {
            case 'ss':
                data.ss++;
                break;
            case 's':
                data.s++;
                break;
            case 'a':
                data.a++;
                break;
            case 'b':
                data.b++;
                break;
            case 'c':
                data.c++;
                break;
            case 'd':
                data.d++;
                break;
        }
        connection.query(`UPDATE users SET catchScores = '${JSON.stringify(data)}' WHERE id = '${id}'`, function (err2, result) {
            if (err2) throw err2;
            console.log(`Added rank ${rank} to user ${id}`)
        });
    });
});

function signUpOrInUser(data, user, res) {
    console.log(data);
    console.log(user);
    connection.query(`SELECT * FROM users WHERE id = '${user.id}'`, function (err, result) {
        if (result.length == 0) {
            console.log(`Creating user for ${user.username}#${user.discriminator}`);
            var sqldata = {
                name: user.username,
                discriminator: user.discriminator,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                id: user.id,
                bio: "Hello world!",
                banner: "https://i.imgur.com/svmBcCG.png",
                catchScores: '{"ss":0,"s":0,"a":0,"b":0,"c":0,"d":0,"bananasSeen":0,"bananasCatched":0, "score":0, "highestCombo":0}',
                roles: '{roles:"krönikör"}'
            }
            connection.query(`INSERT INTO users SET ?`, sqldata, function (err2, result2) {
                if (err2) throw err2;
                res.redirect('/profile/edit')
            });
        } else {
            //update access token
            connection.query(`UPDATE users SET avatar = 'https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png', access_token = '${data.access_token}' WHERE id = '${user.id}'`, function (err2, result2) {
                if (err2) throw err2;
                res.redirect('/profile?user=' + user.id)
            });
        }
    });
}

// Checks if user ID & access token have a permission.
verifyPermission = function (auth, permission) {
    if (auth == null) return new Promise(function (resolve, reject) {
        resolve(false)
    });
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT * FROM users WHERE id = '${auth.id.toString()}' AND access_token = '${auth.access_token}'`, function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                var userRoles = JSON.parse(result[0].roles);
                userRoles.forEach(role => {
                    if (perms[role].permissions[permission]) resolve(true);
                });
                resolve(false);
            } else {
                resolve(false);
            }
        });
    })
}


module.exports = router;
module.exports.signUpOrInUser = signUpOrInUser;