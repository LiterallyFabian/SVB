var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require('glob');

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

function clearDatabase() {
    connection.query(`DELETE FROM beatmaps`, function (err, result) {
        if (err) throw err;
        else {
            console.log(`Deleted all beatmap cache, rebuilding...`)
            buildDatabase();
        }
    });
}

function buildDatabase() {
    glob("catch/song/*.osu", {}, function (er, files) {
        files.forEach(beatmapPath => {
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
                    else if (line.startsWith("Artist:")) artist = line.split(":")[1];
                    else if (line.startsWith("Version:")) difficulty = line.split(":")[1];
                    else if (line.startsWith("Creator:")) creator = line.split(":")[1];
                    else if (line.includes("[HitObjects]")) foundObjects = true;
                } else {
                    if (line.split(",").length > 1) length = parseInt(line.split(",")[2] / 1000);
                }

            })
            //Get thumbnail
            var thumbnail;
            if (fs.existsSync(beatmapPath.replace("osu", "jpg"))) {
                thumbnail = beatmapPath.replace("osu", "jpg")
            } else {
                thumbnail = beatmapPath.replace("osu", "png");
            }
            console.log(`title ${title}\nartist ${artist}\ndifficulty ${difficulty}\n creator${creator}\nthumbnail${thumbnail}\n\n-----------`);

            var data = {
                title: title,
                artist: artist,
                difficulty: difficulty,
                thumbnail: thumbnail,
                length: length,
                creator: creator
            }
            connection.query(`INSERT INTO beatmaps SET ?`, data, function (err2, result) {
                if (err2) throw err2;
                console.log("Map created!");
            });
        })
    })
}

module.exports = router;
module.exports.clearDatabase = clearDatabase;