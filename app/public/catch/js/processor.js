/*
    Processes a beatmap file and adds all its fruit to the queue
    Also controls the audio.
*/
var beatmap;
beatmapData = [];
volume = 50;
var music;
var hitsoundsNormal;
var hitsoundsSoft;
var hitsoundsDrum;
var hitsoundCombobreak;
hitsounds = [];
winAudio = false;
var currentSong;
//timestamp of current song start
var currentStartTime;
var thumbPath;
var songLength;
var musicRange;
var startAudio = new Audio('/catch/audio/confirm-selection.mp3');

function loadDebug() {
    loadGame(`./catch/song/debug`, "Debugging");
}

//start beatmap from ID
function loadID(beatmapID) {
    var map = beatmapDatabase[beatmapID.toString()];
    beatmapData = map;
    loadGame(map.path, map.title)
}

//loads stuff and then starts
function loadGame(path, title) {
    startAudio.volume = document.getElementById("musicRange").value / 100;
    startAudio.play();
    $('#catchField').css('transform', `rotateX(0deg) rotateY(0deg) rotateZ(0deg)`)
    document.getElementById('catchField').style.cursor = 'none';
    currentSong = title;
    gameStarted = true;
    winAudio = new Audio('/catch/audio/rankpass.mp3');

    stopPreview();
    window.scrollTo(0, 0);
    document.title = `svt!catch | ${title}`
    fetch(`/${path}.osu`)
        .then(response => response.text())
        .then(data => {
            beatmap = data.split("\n")
        });
    thumbPath = path + ".jpg";

    if (music) music.pause();
    music = new Audio(`/${path}.mp3`);
    hitsoundCombobreak = new Audio(`/catch/hitsounds/combobreak.mp3`);
    hitsoundsNormal = [new Audio(`/catch/hitsounds/normal-hitnormal.mp3`), new Audio(`/catch/hitsounds/normal-hitwhistle.mp3`), new Audio(`/catch/hitsounds/normal-hitfinish.mp3`), new Audio(`/catch/hitsounds/normal-hitclap.mp3`)]
    hitsoundsSoft = [new Audio(`/catch/hitsounds/soft-hitnormal.mp3`), new Audio(`/catch/hitsounds/soft-hitwhistle.mp3`), new Audio(`/catch/hitsounds/soft-hitfinish.mp3`), new Audio(`/catch/hitsounds/soft-hitclap.mp3`)]
    hitsoundsDrum = [new Audio(`/catch/hitsounds/drum-hitnormal.mp3`), new Audio(`/catch/hitsounds/drum-hitwhistle.mp3`), new Audio(`/catch/hitsounds/drum-hitfinish.mp3`), new Audio(`/catch/hitsounds/drum-hitclap.mp3`)]
    music.onloadeddata = waitForLoad();
}

function waitForLoad() {
    if (typeof music !== "undefined" &&
        typeof beatmap !== "undefined" &&
        music.readyState == 4
    ) {
        processMap()
    } else {
        setTimeout(waitForLoad, 500);
    }
}



function processMap() {
    resetGame();
    var songTime = new Date();
    currentStartTime = songTime;
    beatmap = parseBeatmap(beatmap);


    //Sets background
    document.getElementById('catchField').style.background = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('../${thumbPath}')`;
    document.getElementById('catchField').style.backgroundSize = `cover`;
    document.getElementById('catchField').style.backgroundRepeat = `no-repeat`;
    document.getElementById('catchField').style.backgroundPosition = `center center`;

    //Set volume & play music
    hitsounds = beatmap.hitsounds;
    setTimeout(function () {
        hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100
        });
        hitsoundCombobreak.volume = effectsRange.value / 100;
        music.volume = musicRange.value / 100;
        music.play()
    }, 955)

    //get all fruits
    var fruits = parseFruits(beatmap);

    //summon all fruits
    for (let i = 0; i < fruits.length; i++) {
        setTimeout(function () {
            var thisObj = fruits[i];
            var nextObj = fruits[i + 1];
            var hyper = false;
            if (nextObj && thisObj.fruit.size == 0 && nextObj.fruit.size == 0) {
                var distance = Math.abs(nextObj.fruit.x - thisObj.fruit.x);
                var time = nextObj.delay - thisObj.delay;
                var difficulty = distance / time;
                if (difficulty > 1 && distance > 100) hyper = true;
            }
            summonedFruits.push(new fruit(thisObj.fruit.x, thisObj.fruit.size, thisObj.fruit.hitsound, hyper))
        }, fruits[i].delay)
    }

    //Finish game 3 seconds after last object.
    finishGame(fruits[fruits.length - 2].delay + 3000, currentStartTime);

    //play win audio
    setTimeout(function () {
        if (currentStartTime == songTime) {
            winAudio.volume = document.getElementById("musicRange").value / 100;
            winAudio.play();
        }
    }, fruits[fruits.length - 2].delay + 2000)
}

//Audio
$(document).ready(function () {
    musicRange = document.getElementById("musicRange");
    effectsRange = document.getElementById("effectsRange");
    confettiRange = document.getElementById("confettiToggle");

    musicRange.oninput = function () {
        if (typeof music != "undefined") {
            music.volume = musicRange.value / 100;

        }

    }
    effectsRange.oninput = function () {
        if (hitsounds.length > 0) hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100

        });
    }
    confettiRange.oninput = function () {
        if (!confettiRange.checked) confetti.stop();
    }


    //load volume from cookies
    musicRange.value = getAloneCookie("catchVolumeMusic");
    effectsRange.value = getAloneCookie("catchVolumeEffects");
    document.getElementById("confettiToggle").checked = getAloneCookie("catchConfetti");
})

var saveCookie = setInterval(function () {
    setCookie("catchVolumeMusic", musicRange.value, 10000);
    setCookie("catchVolumeEffects", effectsRange.value, 10000);
    setCookie("catchConfetti", document.getElementById("confettiToggle").checked);
}, 2000);


function resetGame() {
    fruitHasSpawned = false;
    allFruits = [];
    summonedFruits = [];
    fruitLines = [];
    timingLines = [];
    score = 0;
    misses = 0;
    catches = 0;
    kiai = false;
    combo = 0;
    highestCombo = 0;
    bananaShower = false;
    missedFruits = 0;
    catchedFruits = 0;
    missedScore = 0;
    catchedScore = 0;
}

function parseBeatmap(beatmap) {
    var foundTiming, foundObjects = false;
    var result = {
        hitsounds: hitsoundsNormal,
        sliderMultiplier: 1,
        fruitLines: [],
        timingPoints: [],
        timingLines: [],
        beatLength: 0
    }

    beatmap.forEach(line => {
        if (!foundTiming) {
            //set hitsounds
            if (line.includes("SampleSet: Soft")) result.hitsounds = hitsoundsSoft;
            else if (line.includes("SampleSet: Drum")) result.hitsounds = hitsoundsDrum;
            else if (line.includes("SliderMultiplier")) result.sliderMultiplier = parseFloat(line.split(":")[1]);
            else if (line.includes("[TimingPoints]")) foundTiming = true;
        } else {
            if (!foundObjects) {
                if (line.split(",").length > 3) {
                    result.timingLines.push(line);
                } else {
                    if (line.includes("[HitObjects]")) foundObjects = true;
                }
            } else {
                result.fruitLines.push(line);
            }
        }
    });
    var timing = parseTiming(result.timingLines);
    result.timingPoints = timing.timingPoints;
    result.beatLength = timing.beatLength;
    return result;
}

function parseTiming(timingLines) {
    var timingPoints = [];
    var beatLength;
    timingLines.forEach(line => {
        var data = line.split(",");
        toggleKiai(data[7] == 1, data[0], currentStartTime);

        //set beatlength
        if (typeof beatLength == "undefined") {
            beatLength = parseFloat(data[1]);
            console.log(`Default beat length set to ${beatLength} (${Math.round((1 / beatLength * 1000 * 60))} BPM)`)
        } else if (data[6] == 1) {
            timingPoints.push({
                type: "beatLength",
                value: parseFloat(data[1]),
                delay: parseFloat(data[0] - 10)
            });
        } else {
            timingPoints.push({
                type: "beatLengthMultiplier",
                value: -100 / parseFloat(data[1]),
                delay: parseFloat(data[0] - 10)
            });
        }
    });
    return {
        beatLength: beatLength,
        timingPoints: timingPoints
    };
}

function parseFruits(beatmap) {
    var allFruits = [];
    var sliderMultiplier = beatmap.sliderMultiplier;
    var beatLength = beatmap.beatLength;

    var beatLengthMultiplier = 1;
    beatmap.fruitLines.forEach(line => {
        line = line.split(",")
        var delay = parseInt(line[2]);

        if (!fruitHasSpawned) {
            fruitHasSpawned = true;
            resetGame();
        }

        //update beatlength
        var pos = parseInt(line[0]);
        var hitsound = parseInt(line[4]);

        var timing = beatmap.timingPoints.filter(obj => {
            return obj.delay >= delay
        });
        if (timing[0]) {
            if (timing[0].type == "beatLength") beatLength = timing[0].value;
            else beatLengthMultiplier = timing[0].value;
        }

        //line is slider
        if (line.length > 7) {
            //Queue slider-start fruit
            allFruits.push({
                delay: delay,
                fruit: {
                    x: pos,
                    size: 0,
                    hitsound: hitsound
                }
            })

            //Get slider ending position
            var sliderPositions = line[5].split("|")
            var sliderEndPos = sliderPositions[sliderPositions.length - 1].split(":")[0]
            var dropletTiming = beatLength / 100 / sliderMultiplier * 16.8 / beatLengthMultiplier; //time between droplets
            var repeats = parseInt(line[6]); //How many times the slider will repeat
            var sliderLength = parseInt(Math.round(line[7])); //How long the slider is
            var dropletsPerRepeat = parseInt(Math.round(sliderLength / 17));
            var droplets = dropletsPerRepeat * repeats; //amount of droplets slider contains
            var diff = (pos - sliderEndPos) / droplets; //difference in x each droplet should have
            var currentDrop = 0;

            for (var i = 0; i < droplets; i++) {
                var dropPos = pos - (diff * i);
                var dropDelay = (i) * dropletTiming + 20;
                if (currentDrop == dropletsPerRepeat) {
                    allFruits.push({
                        delay: delay + dropDelay,
                        fruit: {
                            x: dropPos,
                            size: 0,
                            hitsound: hitsound
                        }
                    })
                    currentDrop = 0;
                } else
                    allFruits.push({
                        delay: delay + dropDelay,
                        fruit: {
                            x: dropPos,
                            size: 1,
                            hitsound: 0
                        }
                    })
                currentDrop++;
            }
            //Queues slider-end fruit
            //console.log(`bl: ${beatLength} slm: ${sliderMultiplier} tot: ${beatLength / 100 / sliderMultiplier * 17} math: ${beatLength}/100*${sliderMultiplier}*17`)
            allFruits.push({
                delay: delay + (droplets + 1) * dropletTiming,
                fruit: {
                    x: sliderEndPos,
                    size: 0,
                    hitsound: hitsound
                }
            })

        } else if (line[3] != "12") {
            //Queue a large fruit
            allFruits.push({
                delay: delay,
                fruit: {
                    x: pos,
                    size: 0,
                    hitsound: hitsound
                }
            })
        } else {
            //Summons a spinner
            summonSpinner(parseFloat(line[5]) - delay)
        }
        //Sets song length to current line
        if (line.length > 1) songLength = parseInt(line[2]);
    })

    return allFruits;
}