var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require('glob');
const url = require('url');
const fetch = require('node-fetch');
const permissions = require("./permission.js");
const perms = permissions.permissions;

//log-in users through the main page
router.get('/', (req, res) => {
    console.log("login with svt")
    processToken(req, res, false);
});

//log-in users through sajberroyale
router.get('/royale', (req, res) => {
    console.log("login with sajber")
    processToken(req, res, true);
});

//Gets users access token from auth, and then tries to log in or create account
//redirectNew = where to direct new members
function processToken(req, res, fromSajberRoyale) {
    var t_info;
    const urlObj = url.parse(req.url, true);

    if (urlObj.query.code) {
        const data = {
            client_id: '793179363029549057',
            client_secret: process.env.client_secret,
            grant_type: 'authorization_code',
            redirect_uri: process.env.redirect_uri + (fromSajberRoyale ? "/royale" : ""),
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
                    signUpOrInUser(t_info, userdata, res, fromSajberRoyale)
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
}

//check if users access token is valid
router.post("/verify", (req, res) => {
    var access_token = req.body.access_token;
    var id = req.body.id;
    var auth = req.body.auth;
    var royale = req.body.royale;

    if (access_token || id) {
        fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `Bearer ${access_token}`,
                },
            })
            .then(userRes => userRes.json())
            .then(userdata => {
                if (userdata.toString().includes("401: Unauthorized")) return false;
                else {
                    connection.query(`SELECT * FROM users WHERE id = '${id}' and access_token = '${access_token}'`, function (err, resultmain) {
                        if (err) throw err;
                        else if (resultmain.length == 0) res.send(false);
                        else {
                            if (!auth) res.send(true)
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
                        }
                    });
                }
            })
    } else if (royale) {
        connection.query(`SELECT * FROM users WHERE authToken = '${royale}'`, function (err, result) {
            if (err) throw err;
            else if (result.length == 0) res.send(false);
            else {
                res.send(result);
            }
        });
    }
});

//get public userdata from id
router.post("/getuser", (req, res) => {
    var id = req.body.id;
    if (req.body.auth) var auth = JSON.parse(req.body.auth);
    if (!id && !auth) return [];
    if (!id && auth) id = auth.id;
    connection.query(`SELECT name, discriminator, avatar, id, bio, banner, catchScores, royaleScores, roles FROM users WHERE id = '${id}'`, function (err2, result) {
        if (err2) throw err2;
        if (result.length > 0) {
            result[0].perms = perms; //add copy of perm system

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
    var title = req.body.title;

    if (!id) return false;
    connection.query(`SELECT * FROM users WHERE id = '${id}'`, function (err2, result) {
        var data = JSON.parse(result[0].catchScores);
        data.bananasSeen += bananasSeen;
        data.bananasCatched += bananasCatched;
        if (data.score == null) data.score = 0;
        data.score += score;
        if (data.highestCombo == null) data.highestCombo = 0;
        if (highestCombo > data.highestCombo) data.highestCombo = highestCombo;


        var ranks = data.ranks ? data.ranks : {};

        //add a rank count
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
        //add rank badge
        var found = false;
        ['ss', 's', 'a', 'b', 'c', 'd'].forEach(r => {
            if (r == ranks[title]) found = true;
            if (r == rank && !found) {
                ranks[title] = rank;
                found = true;
            }
        })
        data.ranks = ranks;
        connection.query(`UPDATE users SET catchScores = '${JSON.stringify(data)}' WHERE id = '${id}'`, function (err2, result) {
            if (err2) throw err2;
            console.log(`Added rank ${rank} to user ${id}`)
        });
    });
});

function signUpOrInUser(data, user, res, fromSajberRoyale) {
    //console.log(data);
    //console.log(user);
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
                royaleScores: '{"gamesPlayed":0, "gamesWon":0,"kills":0,"deaths":0,"damageDone":0,"damageTaken":0,"healthRegenerated":0,"shotsFired":0,"shotsHit":0, "emotesEmoted":0, "itemsPickedup":0, "lockersOpened":0}',
                authToken: Math.floor(Math.random() * Math.floor(999999)),
                roles: '["krönikör"]'
            }
            res.cookie("access", sqldata.authToken, {
                expires: new Date(Date.now() + 3600000 * 24 * 7)
            });
            connection.query(`INSERT INTO users SET ?`, sqldata, function (err2, result2) {
                if (err2) throw err2;
                res.redirect((fromSajberRoyale ? "/profile/auth?user=" : "/profile/edit?id=" + user.id))
            });
        } else {

            //set sajberroyale accsss token
            connection.query(`SELECT authToken FROM users WHERE id = '${user.id}'`, function (err2, result) {
                if (err2) throw err2;
                console.log(result[0].authToken);
                res.cookie("access", result[0].authToken, {
                    expires: new Date(Date.now() + 3600000 * 24 * 7)
                });
            });
            //update discord access token
            connection.query(`UPDATE users SET avatar = 'https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png', access_token = '${data.access_token}' WHERE id = '${user.id}'`, function (err2, result) {
                if (err2) throw err2;
                res.redirect((fromSajberRoyale ? "/profile/auth" : "/profile/?user=" + user.id))
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

//Gets all public users
router.post('/getusers', (req, res) => {
    connection.query("SELECT name,avatar,id,roles,bio,banner FROM users", function (err, result) {
        if (err) throw err;
        else {
            result[0].perms = perms;
            res.send(result);
        }
    });
});

//Gets all sajberroyale stats
router.post('/getroyale', (req, res) => {
    connection.query("SELECT name,avatar,id,royaleScores FROM users", function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});



module.exports = router;
module.exports.signUpOrInUser = signUpOrInUser;