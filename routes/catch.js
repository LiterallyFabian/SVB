var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require('glob');
var jimp = require("jimp");
var beatmaplist;

//Gets all beatmaps
router.post('/getmaps', (req, res) => {
    connection.query("SELECT * FROM beatmaps", function (err, result) {
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
        beatmaplist = result;
        addBeatmaps();
    })
}

function addBeatmaps() {

    glob("catch/song/*.osu", {}, function (er, files) {
        var i = 0;
        files.forEach(beatmapPath => {
            //check if beatmap is already in
            if (beatmapPath != "catch/song/debug.osu" && !beatmaplist.some(i => i.path.includes(beatmapPath.replace(".osu", "")))) {
                var beatmap = fs.readFileSync(beatmapPath, 'utf8').split('\n');
                var title;
                var artist;
                var difficulty;
                var creator;
                var foundObjects = false;
                var length = 0;
                //Set metadata
                beatmap.forEach(line => {
                    if (!foundObjects) {
                        if (line.startsWith("Title:")) title = line.split(":")[1];
                        else if (line.startsWith("Artist:")) artist = line.substring(line.indexOf(":") + 1);
                        else if (line.startsWith("Version:")) difficulty = line.split(":")[1];
                        else if (line.startsWith("Creator:")) creator = line.split(":")[1];
                        else if (line.includes("[HitObjects]")) foundObjects = true;
                    } else {
                        if (line.split(",").length > 1) length = parseInt(line.split(",")[2] / 1000);
                    }

                })
                //Get thumbnail
                var thumbnail = beatmapPath.replace("osu", "jpg");
                var icon = thumbnail.replace(".jpg", "_icon.jpg");
                //console.log(`title ${title}\nartist ${artist}\ndifficulty ${difficulty}\n creator ${creator}\nthumbnail ${thumbnail}\n\n-----------`);

                jimp.read(thumbnail, function (err, img) {
                    if (err) throw err;
                    img.resize(250, jimp.AUTO) // resize
                        .quality(85) // set JPEG quality
                        .write(icon); // save
                    console.log('Resized thumbnail.')
                });
                var data = {
                    title: title,
                    artist: artist,
                    difficulty: difficulty,
                    path: beatmapPath.replace(".osu", ""),
                    length: length,
                    creator: creator
                }
                connection.query(`INSERT INTO beatmaps SET ?`, data, function (err2, result) {
                    if (err2) throw err2;
                    console.log(`Map entry "${title}" created! ${++i}/${files.length-1}`);
                });
            }

        })
    })
}


module.exports = router;
module.exports.getMaps = getMaps;