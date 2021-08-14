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
var csModifier;
var arModifier;
var scoreMultiplier = 1;
var dtModifier = 1; //Modifier on SPEED, for example catcher moves 2x faster
var delayModifier; //Modifier on DELAY, for example object drops 2/3x faster
var fruitDropTime = 955;
var startAudio = new Audio('/catch/audio/confirm-selection.mp3');

function loadDebug() {
    loadGame(`./catch/song/debug`, "Debugging");
}

//start beatmap from ID
function loadID(beatmapID) {
    resetGame();
    var map = beatmapDatabase[beatmapID.toString()];
    beatmapData = map;
    if (typeof beatmapData.colors != "object")
        beatmapData.colors = JSON.parse(beatmapData.colors);
    loadGame(map.path, map.title)
}

//loads stuff and then starts
function loadGame(path, title) {
    startAudio.volume = document.getElementById("musicRange").value / 100;
    startAudio.play();
    document.getElementById('catchField').style.cursor = 'none';
    currentSong = title;
    winAudio = new Audio('/catch/audio/rankpass.mp3');

    stopPreview();
    window.scrollTo(0, 0);
    document.title = `svb!catch | ${title}`
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

var intervalsLoaded = 0;

function waitForLoad() {
    if (typeof music !== "undefined" &&
        typeof beatmap !== "undefined" &&
        music.readyState == 4
    ) {
        processMap()
    } else {
        setTimeout(waitForLoad, 500);

        if (intervalsLoaded++ > 2) {
            var x = document.getElementById("snackbar");
            x.className = "show";
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000)
        }
    }
}



function processMap() {
    lockMods();

    gameStarted = true;
    var songTime = new Date();
    currentStartTime = songTime;

    //Sets background
    setBackground(`../${thumbPath}`);

    //set delay modifiers, AR & CS 
    delayModifier = 1;
    if (activeMods.includes("dt")) delayModifier = 2 / 3;
    else if (activeMods.includes("ht")) delayModifier = 4 / 3;

    dtModifier = 1;
    if (activeMods.includes("dt")) dtModifier = 1.5;
    else if (activeMods.includes("ht")) dtModifier = 0.75;


    ar = beatmapData.approachrate * dtModifier;
    if (activeMods.includes("hr")) ar *= 1.5;
    else if (activeMods.includes("ez")) ar *= 0.7;

    arModifier = ar / 6.5;
    fruitDropTime = 955 / arModifier

    cs = beatmapData.circlesize;
    if (activeMods.includes("hr")) cs *= 1.3;
    else if (activeMods.includes("ez")) cs *= 0.7;

    csModifier = cs / (cs <= 3 ? 3 : 4.5);
    catcher.width = catcher.originalWidth / csModifier;
    catcher.height = catcher.originalHeight / csModifier;

    activeMods.forEach(mod => {
        scoreMultiplier *= mods[mod].score;
    })

    startEggs(beatmapData.id);
    beatmap = parseBeatmap(beatmap);

    //Set volume & play music
    hitsounds = beatmap.hitsounds;
    setTimeout(function () {
        hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100
        });
        hitsoundCombobreak.volume = effectsRange.value / 100;
        music.volume = musicRange.value / 100;
        if (activeMods.includes("dt")) music.playbackRate = 1.5;
        else if (activeMods.includes("ht")) music.playbackRate = 0.75;
        music.play();
    }, fruitDropTime)

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

    //Finish game 
    songLength = fruits[fruits.length - 2].delay;
    finishGame(fruits[fruits.length - 2].delay, currentStartTime);
}

//Save settings
$(document).ready(function () {
    musicRange = document.getElementById("musicRange");
    effectsRange = document.getElementById("effectsRange");

    musicRange.oninput = function () {
        if (typeof music != "undefined") {
            music.volume = musicRange.value / 100;
        }
        setCookie("catchVolumeMusic", musicRange.value, 10000);
    }
    effectsRange.oninput = function () {
        if (hitsounds.length > 0) hitsounds.forEach(hs => {
            hs.volume = effectsRange.value / 100
        });
        setCookie("catchVolumeEffects", effectsRange.value, 10000);

    }


    //load volume from cookies
    musicRange.value = getAloneCookie("catchVolumeMusic");
    effectsRange.value = getAloneCookie("catchVolumeEffects");
})

function resetGame() {
    allFruits = [];
    summonedFruits = [];
    fruitLines = [];
    timingLines = [];
    kiai = false;
    bananaShower = false;
    gameStarted = false;
    scoreMultiplier = 1;

    stats = {
        bananasSeen: 0,
        bananasCatched: 0,
        catchedFruits: 0,
        missedFruits: 0,
        catchedScore: 0,
        missedScore: 0,
        score: 0,
        combo: 0,
        highestCombo: 0
    }
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
    var timingData = parseTiming(result.timingLines);
    result.timingPoints = timingData.timing;
    result.defaultBeatLength = timingData.def;
    return result;
}

function parseTiming(timingLines) {
    var timingPoints = [];
    var lastBeatLength;
    var defaultBeatLength = -1;
    timingLines.forEach(line => {
        var data = line.split(",");
        var time = (parseInt(data[0]) - 1) * delayModifier;
        var beatLength = parseInt(data[1]);
        var meter = data[2];
        var sampleSet = data[3];
        var sampleIndex = data[4];
        var volume = data[5];
        var uninherited = data[6] == 1;
        var kiai = data[7] == 1;

        toggleKiai(kiai, time, currentStartTime);

        //set beatlengths
        if (uninherited) {
            timingPoints.push({
                value: beatLength,
                delay: time - 1,
                kiai: kiai
            });
            lastBeatLength = beatLength
            if (defaultBeatLength == -1) {
                defaultBeatLength = beatLength;
                console.log(`Default beat length set to ${beatLength} (${Math.round(1 / beatLength * 1000 * 60)} BPM)`)
            }

        } else {
            timingPoints.push({
                value: lastBeatLength / (-100 / beatLength),
                delay: time - 1,
                kiai: kiai
            });
        }
    });
    if (defaultBeatLength == -1) {
        defaultBeatLength = 500;
        console.error(`Default beat length could not be found!`, timingLines);
    }
    return {
        def: defaultBeatLength,
        timing: timingPoints
    };
}

function parseFruits(beatmap) {
    var allFruits = [];
    var sliderMultiplier = beatmap.sliderMultiplier;
    var beatLength = beatmap.defaultBeatLength;

    beatmap.fruitLines.forEach(line => {
        line = line.split(",");
        var pos = parseInt(line[0]); //x
        var delay = parseInt(line[2]) * delayModifier;
        var defaultHitsound = parseInt(line[4]);

        //this line is a SLIDER
        if (line.length > 7) {
            var overrideHitsounds = line.length > 8;
            var sliderHitsounds = overrideHitsounds ? line[8].split("|") : [];
            var currentHitsound = 0;

            //Queue slider-start fruit
            allFruits.push({
                delay: delay,
                fruit: {
                    x: pos,
                    size: 0,
                    hitsound: overrideHitsounds ? sliderHitsounds[currentHitsound++] : defaultHitsound
                }
            })

            //Update beatLength
            var timing = beatmap.timingPoints.filter(obj => {
                return obj.delay < delay
            });
            if (timing[0]) beatLength = timing[timing.length - 1].value;

            //Get slider ending position
            var sliderPositions = line[5].split("|")
            var sliderEndPos = sliderPositions[sliderPositions.length - 1].split(":")[0]
            var repeats = parseInt(line[6]); //How many times the slider will repeat
            var sliderLength = line[7] / (sliderMultiplier * 100) * beatLength * repeats; //How long the slider is in milliseconds
            var dropletsPerRepeat = line[7] / 20;
            var droplets = dropletsPerRepeat * repeats; //amount of droplets slider contains
            var dropletDelay = sliderLength / droplets * delayModifier;
            var diff = (pos - sliderEndPos) / droplets; //difference in x each droplet should have

            var currentDrop = 0;
            for (var i = 0; i < droplets; i++) {
                var dropPos = pos - (diff * i);
                if (currentDrop == dropletsPerRepeat) {
                    allFruits.push({
                        delay: delay + dropletDelay * i,
                        fruit: {
                            x: dropPos,
                            size: 0,
                            hitsound: overrideHitsounds ? sliderHitsounds[currentHitsound++] : defaultHitsound
                        }
                    })
                    currentDrop = 0;
                } else
                    allFruits.push({
                        delay: delay + dropletDelay * i,
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
                delay: delay + droplets * dropletDelay,
                fruit: {
                    x: sliderEndPos,
                    size: 0,
                    hitsound: overrideHitsounds ? sliderHitsounds[currentHitsound++] : defaultHitsound
                }
            })

        } else if (line[3] != "12") {
            //Queue a large fruit
            allFruits.push({
                delay: delay,
                fruit: {
                    x: pos,
                    size: 0,
                    hitsound: defaultHitsound
                }
            })
        } else {
            //Summons a spinner
            for (let i = delay; i < parseFloat(line[5]) * delayModifier; i += 60) {
                allFruits.push({
                    delay: i,
                    fruit: {
                        x: Math.floor(Math.random() * 512),
                        size: 2,
                        hitsound: -1
                    }
                });
                stats.bananasSeen++;
            }
        }
    })

    return allFruits;
}