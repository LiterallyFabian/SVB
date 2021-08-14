var express = require('express');
var router = express.Router();
var rgb2hex = require('rgb2hex');
var fs = require('fs');
var glob = require('glob');
var jimp = require("jimp");
var MP3Cutter = require('mp3-cutter');
var beatmaplist = {};

//Gets all beatmaps
router.post('/getmaps', (req, res) => {
    connection.query("SELECT * FROM beatmaps ORDER BY stars", function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

//Gets a beatmap from ID
router.post('/getmap', (req, res) => {
    var ID = req.body.ID;
    connection.query(`SELECT * FROM posts WHERE id = '${ID}'`, function (err, result) {
        if (err) throw err;
        else {
            res.send(result);
        }
    });
});

function getMaps() {
    connection.query("SELECT * FROM beatmaps", function (err, result) {
        if (err) throw err;
        result.forEach(bmap => {
            beatmaplist[bmap.id.toString()] = bmap;
        })

        addBeatmaps();
    })
}

function addBeatmaps() {
    var colorRegex = /Combo\d+ : (\d+),(\d+),(\d+)/gm;

    glob(__dirname + "/../public/catch/song/*.osu", {}, function (er, files) {
        var i = 0;
        files.forEach(beatmapPath => {
            //Add to MySQL 
            var cleanPath = beatmapPath.split("public/")[1].replace(".osu", "");

            if (Object.values(beatmaplist).filter(e => e.path === cleanPath).length == 0) {
                //array with every line from the beatmap
                var beatmap = fs.readFileSync(beatmapPath, 'utf8').split('\n');

                var beatmapData = {
                    approachrate: 9,
                    circlesize: 5,
                    colors: ["#ffc000", "#00ca00", "#127cff", "#f21839"]
                };
                var foundTiming = false;
                var foundObjects = false;
                var foundColors = false;
                var hitobjects = [];

                //Set metadata
                beatmap.forEach(line => {
                    if (!foundObjects) {
                        if (line.startsWith("Title:")) beatmapData.title = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("Artist:")) beatmapData.artist = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("SampleSet:")) beatmapData.sampleset = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("Version:")) {
                            beatmapData.difficulty = line.substring(line.indexOf(":") + 1).trim();
                            beatmapData.id = (beatmapData.title + beatmapData.difficulty).hashCode();
                            if (beatmapData.id < 0) beatmapData.id *= -1;
                        } else if (line.startsWith("Creator:")) beatmapData.creator = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("PreviewTime:")) beatmapData.previewtime = line.substring(line.indexOf(":") + 1);
                        else if (line.startsWith("Tags:")) beatmapData.tags = line.substring(line.indexOf(":") + 1).replace("\r", "");
                        else if (line.startsWith("BeatmapID:")) beatmapData.id = line.substring(line.indexOf(":") + 1).trim();
                        else if (line.startsWith("ApproachRate:")) beatmapData.approachrate = line.substring(line.indexOf(":") + 1);
                        else if (line.startsWith("CircleSize:")) beatmapData.circlesize = line.substring(line.indexOf(":") + 1);

                        //found objects
                        else if (line.includes("[HitObjects]")) foundObjects = true;


                        //check for colors
                        if (line.startsWith("Combo")) {
                            if (!foundColors) {
                                foundColors = true;
                                beatmapData.colors = [];
                            }
                            var color = rgb2hex(`rgb(${line.split(" : ")[1]})`).hex;
                            beatmapData.colors.push(color);
                        }


                        //found timing points for BPM
                        if (foundTiming) {
                            if (line.trim() == "") {
                                foundTiming = false;
                            } else {
                                var timing = line.split(",")[0];
                                var beatLength = line.split(",")[1];
                                if (beatLength > 0 && parseFloat(timing) < beatmapData.previewtime) {
                                    beatmapData.bpm = 1 / beatLength * 1000 * 60;
                                }
                            }
                        }
                        if (line.includes("[TimingPoints]")) foundTiming = true;

                        //add hitobjects
                    } else {
                        if (line.split(",").length > 1) {
                            beatmapData.length = parseInt(line.split(",")[2] / 1000);
                            hitobjects.push(line);
                        }
                    }
                })

                //Create thumbnail & preview audio if needed
                createThumbnail(beatmapPath);
                createPreview(beatmapPath, beatmapData.previewtime);
                beatmapData.stars = calculateDifficulty(hitobjects);
                beatmapData.colors = JSON.stringify(beatmapData.colors);
                beatmapData.path = cleanPath;
                console.log(beatmapData);
                connection.query(`INSERT INTO beatmaps SET ?`, beatmapData, function (err, result) {
                    if (err) throw err;
                    console.log(`Map entry ${beatmapData.title} created! ${++i}/${files.length - 1}`);
                });
            }

        })
    })
}

function createThumbnail(path) {
    var thumbnail = path.replace("osu", "jpg");
    var icon = thumbnail.replace("song/", "song/icon/");

    fs.access(icon, fs.F_OK, (err) => {
        if (err) {
            jimp.read(thumbnail, function (err, img) {
                if (err) throw err;
                img.resize(250, jimp.AUTO) // resize
                    .quality(85) // set JPEG quality
                    .write(icon); // save
                console.log(`Resized thumbnail at "${icon}"`)
            });
        }
    })
}

function createPreview(path, previewTime) {
    var audio = path.replace("osu", "mp3");
    var preview = audio.replace("song/", "song/preview/");

    fs.access(preview, fs.F_OK, (err) => {
        if (err) {
            MP3Cutter.cut({
                src: audio,
                target: preview,
                start: previewTime / 1000,
                end: previewTime / 1000 + 10
            });
            console.log(`Trying to cut "${preview}"`)
        }
    })
}

function calculateDifficulty(hitobjects) {
    var stars = 0;
    var lastPos = 320;
    var lastHit = 0;
    hitobjects.forEach(line => {
        var fruit = line.split(',');
        var thisPos = fruit[0];
        var thisHit = fruit[2];

        var distance = Math.abs(lastPos - thisPos);
        var time = thisHit - lastHit;

        //add star rating depending on distance & time
        //only modify star rating if time < 1s and distance > 10
        if (time < 1000 && distance > 10) {
            if (time > 0)
                stars += distance / time;
        }

        lastPos = thisPos;
        lastHit = thisHit;
    })
    return stars / hitobjects.length * 13;
}

function calculatePerformance(combo, acc, catches, misses, id, multiplier, mods) {

    if (!beatmaplist[id]) {
        console.log("Beatmap ID " + id + " not found");
        return 0;
    }
    var ar = beatmaplist[id].approachrate;
    if (mods.includes("hr")) ar *= 1.5;
    else if (mods.includes("ez")) ar *= 0.7;

    ar = Math.max(ar, 10);

    var mcombo = catches + misses;
    var stars = beatmaplist[id].stars;

    if (mods.includes("dt")) stars *= 1.1;
    if (mods.includes("hr")) stars *= 1.05;
    if (mods.includes("ez")) stars *= 0.7;
    if (mods.includes("ht")) stars *= 0.5;

    if (typeof acc != "number") acc = 100 - (misses / mcombo * 100);

    /*console.log("----------------");
    console.log(combo);
    console.log(acc);
    console.log(catches);
    console.log(misses);
    console.log(id);
    console.log(ar);
    console.log(mcombo);
    console.log(stars)*/


    // Conversion from Star rating to pp
    final = Math.pow(((5 * (stars) / 0.0049) - 4), 2) / 100000;

    // Length Bonus
    lengthbonus = (0.95 + 0.3 * Math.min(1.0, mcombo / 2500.0) + (mcombo > 2500 ? Math.log10(mcombo / 2500.0) * 0.475 : 0.0));
    final *= lengthbonus;

    // Miss Penalty
    final *= Math.pow(0.97, misses);

    // Not FC combo penalty
    final *= Math.pow(combo / mcombo, 0.8);

    // AR Bonus
    arbonus = 1;
    if (ar > 9)
        arbonus += 0.1 * (ar - 9.0);
    if (ar > 10)
        arbonus += 0.1 * (ar - 10.0);
    if (ar < 8)
        arbonus += 0.025 * (8.0 - ar);
    final *= arbonus;

    // Hidden bonus
    hiddenbonus = 1;
    if (ar > 10)
        hiddenbonus = 1.01 + 0.04 * (11 - Math.min(11, ar));
    else
        hiddenbonus = 1.05 + 0.075 * (10 - ar);


    // Acc Penalty
    final *= Math.pow(acc / 100, 5.5);
    final = Math.round(100 * final) / 100;

    if (mods.includes("hd") || mods.includes("fi")) final *= hiddenbonus;
    if (mods.includes("fl")) final *= 1.35;
    return final * multiplier;
}

//gets an unique int-hash from a string. just to give all maps a consistent ID even if they don't have one included
String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/*
router.get('/updateall', (req, res) => {
    connection.query(`SELECT id,catchScores FROM users`, function (err, result) {
        if (err) throw err;
        result.forEach(user => {
            var scores = JSON.parse(user.catchScores).ranks;
            if (typeof scores == "object") {
                scores = Object.values(scores);
                var newScores = JSON.parse(user.catchScores);

                scores.forEach(score => {
                    if (typeof score == "object") {
                        score.pp = calculatePerformance(score.combo, score.accuracy, score.catches, score.misses, score.id)
                        newScores.ranks[score.id] = score;
                    }
                })
                console.log(`Calculated performance for user ${user.id}`)
                connection.query(`UPDATE users SET catchScores = ${connection.escape(JSON.stringify(newScores))} WHERE id = '${user.id}'`)
            }
        })
    });
    res.send("done")
});

router.get("/fixranks", (req, res) => {
    connection.query(`SELECT id,catchScores FROM users`, function (err, result) {
        if (err) throw err;
        result.forEach(user => {
            var scores = JSON.parse(user.catchScores).ranks;
            if (typeof scores == "object") {
                scores = Object.values(scores);
                var newScores = JSON.parse(user.catchScores);

                scores.forEach(score => {
                    if (typeof score == "object") {
                        var acc = score.accuracy;
                        if (acc > 0) {
                            if (acc == 100) score.rank = 'ss';
                            else if (acc > 98) score.rank = 's';
                            else if (acc > 94) score.rank = 'a';
                            else if (acc > 90) score.rank = 'b';
                            else if (acc > 85) score.rank = 'c';
                            else score.rank = 'd';
                        }
                        newScores.ranks[score.id] = score;
                    }
                })
                console.log(`Fixed ranks for ${user.id}`)
                connection.query(`UPDATE users SET catchScores = ${connection.escape(JSON.stringify(newScores))} WHERE id = '${user.id}'`)
            }
        })
    });
    res.send("done")
})
*/

module.exports = router;
module.exports.getMaps = getMaps;
module.exports.beatmaplist = beatmaplist;
module.exports.calculatePerformance = calculatePerformance;