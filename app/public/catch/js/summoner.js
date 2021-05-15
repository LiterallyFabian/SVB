/*
    Handles summoning of objects
*/

//Queues an object
//Sizes: 0 - large, 1 - droplet, 2 - banana
function summonFruit(delay, pos, size, hitsound) {
    setTimeout(function () {
        fruits.push(new fruit(scaleModifier * pos * 2.1 + 180, size, hitsound))
    }, delay);
}

//Queues a banana shower
function summonSpinner(start, stop) {
    setTimeout(function () {
        bananaShower = true;
    }, parseInt(start, 10));
    setTimeout(function () {
        bananaShower = false;
    }, parseInt(stop, 10));
}

//Summons a banana every 60ms if a banana shower is active
window.setInterval(function () {
    if (typeof bananaShower == "undefined") return;
    if (bananaShower) {
        fruits.push(new fruit(Math.floor(Math.random() * 1500) + 220, 2));
        stats_bananasSeen++;
    }
}, 60);

deg = 0.1;
//Rotates the catch field
window.setInterval(function () {
    if (score > 0) {
        deg += 0.5;
        var degrees = document.getElementById("rotationSettings").value.split(' ');
        $('#catchField').css('transform', `rotateY(${deg * degrees[0]}deg) rotateZ(${deg * degrees[1]}deg) rotateX(${deg * degrees[2]}deg)`)
    }
}, 10);

//Queues a kiai-toggle
function toggleKiai(kiaiOn, delay) {
    //stop confetti slightly before kiai stops
    if (!kiaiOn) {
        setTimeout(function () {
            confetti.stop();
        }, delay - 2000);
    }
    setTimeout(function () {
        kiai = kiaiOn;
        if (kiaiOn && !document.getElementById("confettiToggle").checked) confetti.start();
        else confetti.stop();
    }, delay);
}

//Queues a statupdate 3 seconds after game is finished
function finishGame(delay) {
    setTimeout(function () {
        var rank;
        var acc = missedFruits == 0 ? 100 : catchedFruits / (catchedFruits + missedFruits) * 100;
        if (missedFruits == 0) rank = 'ss';
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