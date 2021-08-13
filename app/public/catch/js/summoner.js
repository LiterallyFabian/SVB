/*
    Handles summoning of objects
*/

//Queues a kiai-toggle
function toggleKiai(kiaiOn, delay, timestamp) {
    //stop confetti slightly before kiai stops
    setTimeout(function () {
        if (currentStartTime != timestamp) return;
        var kiaiBefore = kiai;
        kiai = kiaiOn;
        if (kiaiOn) {
            if (!kiaiBefore) confettiSides();
        }
    }, parseInt(delay) + fruitDropTime); //the music is delayed by 955ms as it takes the fruits that long to drop
}

//Queues a statupdate 3 seconds after game is finished
function finishGame(delay, timestamp) {
    setTimeout(function () {
        if (currentStartTime != timestamp) return;
        lockMods(false);
        var rank;
        var silver = activeMods.includes("fl") || activeMods.includes("hd") || activeMods.includes("fi");
        var acc = missedFruits == 0 ? 100 : catchedFruits / (catchedFruits + missedFruits) * 100;
        if (missedScore == 0 && silver) rank = 'ssx';
        else if (missedScore == 0) rank = 'ss';
        else if (acc > 98 && silver) rank = 'sx';
        else if (acc > 98) rank = 's';
        else if (acc > 94) rank = 'a';
        else if (acc > 90) rank = 'b';
        else if (acc > 85) rank = 'c';
        else rank = 'd'
        gameStarted = false;
        setMedal(rank, score, highestCombo);
        scoreMultiplier = 1;
        //check if logged in
        this.usercookie = getCookie("auth")
        if (this.usercookie.length > 0) {
            var data = JSON.parse(this.usercookie);
            id = data.id;
        } else return;

        axios.post('/user/updatecatch', {
            rank: rank,
            mods: JSON.stringify(activeMods),
            scoreMultiplier: scoreMultiplier,
            bananasCatched: stats_bananasCatched,
            bananasSeen: stats_bananasSeen,
            missedFruits: missedFruits,
            catchedFruits: catchedFruits,
            missedScore: missedScore,
            catchedScore: catchedScore,
            score: parseInt(score),
            highestCombo: highestCombo,
            userid: id,
            title: currentSong,
            mapid: beatmapData.id
        })
    }, delay + 2000);

    //play win audio 
    setTimeout(function () {
        if (currentStartTime == timestamp) {
            winAudio.volume = document.getElementById("musicRange").value / 100;
            winAudio.play();
        }
    }, delay + 1000)
}

function confettiSides() {
    var end = Date.now() + (1000);

    (function frame() {
        confettiCannon({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: {
                x: 0,
                y: 1
            },
            colors: beatmapData.colors
        });
        confettiCannon({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: {
                x: 1,
                y: 1
            },
            colors: beatmapData.colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}