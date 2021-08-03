/*
    Handles summoning of objects
*/
var bananaShower = false; //whether a banana shower is active

//Queues a banana shower
function summonSpinner(start, stop) {
    setTimeout(function () {
        bananaShower = true;
        setTimeout(function () {
            bananaShower = false;
        }, parseInt(stop - start));
    }, parseInt(start));
}

//Summons a banana every 60ms if a banana shower is active
window.setInterval(function () {
    if (typeof bananaShower != "undefined")
        if (bananaShower) {
            summonedFruits.push(new fruit(Math.floor(Math.random() * 512), 2));
            stats_bananasSeen++;
        }
}, 60);

deg = 0.1;
//Rotates the catch field
window.setInterval(function () {
    if (typeof bananaShower != "undefined")
        if (score > 0) {
            deg += 0.5;
            var degrees = document.getElementById("rotationSettings").value.split(' ');
            $('#catchField').css('transform', `rotateY(${deg * degrees[0]}deg) rotateZ(${deg * degrees[1]}deg) rotateX(${deg * degrees[2]}deg)`)
        }
}, 10);

//Queues a kiai-toggle
function toggleKiai(kiaiOn, delay, timestamp) {
    //stop confetti slightly before kiai stops
    if (!kiaiOn) {
        setTimeout(function () {
            confetti.stop();
        }, delay - 2000);
    }
    setTimeout(function () {
        if (currentStartTime != timestamp) return;
        var kiaiBefore = kiai;
        kiai = kiaiOn;
        if (kiaiOn && !document.getElementById("confettiToggle").checked) {
            confetti.start();
            if (!kiaiBefore) confettiSides();
        } else confetti.stop();
    }, parseInt(delay) + 955); //the music is delayed by 955ms as it takes the fruits that long to drop
}

//Queues a statupdate 3 seconds after game is finished
function finishGame(delay, timestamp) {
    setTimeout(function () {
        if (currentStartTime != timestamp) return;
        var rank;
        var acc = missedFruits == 0 ? 100 : catchedFruits / (catchedFruits + missedFruits) * 100;
        if (missedScore == 0) rank = 'ss';
        else if (acc > 98) rank = 's';
        else if (acc > 94) rank = 'a';
        else if (acc > 90) rank = 'b';
        else if (acc > 85) rank = 'c';
        else rank = 'd'
        gameStarted = false;
        confetti.stop();
        setMedal(rank, score, highestCombo);

        //check if logged in
        this.usercookie = getCookie("auth")
        if (this.usercookie.length > 0) {
            var data = JSON.parse(this.usercookie);
            id = data.id;
        } else return;

        axios.post('/user/updatecatch', {
            rank: rank,
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
    }, delay);
}

function confettiSides() {
    var end = Date.now() + (1000);

    var colors = JSON.parse(beatmapData.colors);

    (function frame() {
        confettiCannon({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: {
                x: 0,
                y: 1
            },
            colors: colors
        });
        confettiCannon({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: {
                x: 1,
                y: 1
            },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}