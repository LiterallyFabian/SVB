/*
    Handles fruit gravity and collissions
*/
lastMiss = false;

stats_bananasSeen = 0;
stats_bananasCatched = 0;

function fruit(x, size, hitsound, hyper = false) {
    this.x = scaleModifier * x * 2.5;
    this.y = -100 * scaleModifier / csModifier;
    this.catched = false;
    this.speedY = 5;
    this.hitsound = -1;
    this.size = size;
    this.score = 0;
    this.hyper = hyper;
    if (size == 0) { //normal fruit
        this.sprite = hyper ? hyperImage : fruitImages[Math.floor(Math.random() * fruitImages.length)];
        this.width = 80;
        this.height = 80;
        this.hitsound = hitsound;
        this.score = 300;
    } else if (size == 1) { //droplet
        this.sprite = dropletImage;
        this.width = 41;
        this.height = 51;
        this.score = 50;
    } else if (size == 2) { //banana
        this.sprite = bananaImage;
        this.width = 70;
        this.height = 70;
        this.score = 1000;
    }

    this.width /= csModifier;
    this.height /= csModifier;

    this.width *= scaleModifier;
    this.height *= scaleModifier;


    context.drawImage(this.sprite, this.x, this.y, this.width, this.height);

    this.updatePos = function (relativeSpeedMultiplier) {
        this.y += this.speedY * scaleModifier * relativeSpeedMultiplier * arModifier;
        if (activeMods.includes("hd")) context.globalAlpha = getFade(200, 300, this.y);
        else if (activeMods.includes("fi")) context.globalAlpha = getFade(100, -200, this.y);
        context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        context.globalAlpha = 1;
    }

    this.checkCollision = function () {
        if (this.catched) return;
        //catch
        if (collides(this, catcher)) {
            this.x = 10000;
            this.catched = true;
            lastMiss = false;
            //Add score
            if (this.size != 2) {
                smoothAcc(this.score, false);
                addScore(this.score + (this.score * ((combo - (combo != 0 ? 0 : combo - 1)) / 25)));
            }
            if (this.size == 0) {
                combo++;
                catchedFruits++;
                if (combo > highestCombo) highestCombo = combo;
                hyperSpeedModifier = this.hyper ? 1.25 : 1;
            }
            if (this.size == 2) {
                addScore(this.score);
                stats_bananasCatched++;
            }

            playHitsound(this.hitsound)

        } //miss
        else if (this.y > 680 * scaleModifier && this.x != 10000 && !isNaN(this.x)) {
            hyperSpeedModifier = 1;
            //console.log(`missed [${this.size}] with x ${this.x} sprite ${this.sprite} score ${this.score}`)
            //this.x = 10000;
            this.catched = true;
            if (this.size != 2) {
                smoothAcc(this.score, true);
                lastMiss = true;
            }
            if (this.size == 0) {
                if (combo > 15) hitsoundCombobreak.play();
                combo = 0;
                missedFruits++;
            }
        }

    }
}

function smoothAcc(addedscore, isMiss) {
    var i = 0;

    function Loop() {
        setTimeout(function () {
            if (isMiss) missedScore += addedscore / 25;
            else catchedScore += addedscore / 25;
            i++;
            if (i < 25) {
                Loop();
            }
        }, 18)
    }

    Loop();
}

function addScore(addedscore) {
    var i = 0;

    function Loop() {
        setTimeout(function () {
            score += addedscore / 25;
            i++;
            if (i < 25) {
                Loop();
            }
        }, 18)
    }

    Loop();
}


function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

function playHitsound(id) {
    //clap
    if (id == 8 || id == 10 || id == 12 || id == 14) {
        hitsounds[3].currentTime = 0;
        hitsounds[3].play();
    } //finish
    if (id == 4 || id == 6 || id == 12 || id == 14) {
        hitsounds[2].currentTime = 0;
        hitsounds[2].play();
    } //whistle
    if (id == 2 || id == 6 || id == 10 || id == 14) {
        hitsounds[1].currentTime = 0;
        hitsounds[1].play();
    } //normal
    if (id == 0) {
        hitsounds[0].currentTime = 0;
        hitsounds[0].play();
    }
}

function getFade(start, end, pos) {
    let startFade = start * scaleModifier;
    let endFade = end * scaleModifier;
    let opacity = pos > startFade ? (endFade - pos) / (endFade - startFade) : 1;
    if (opacity < 0) opacity = 0;

    if (end < 0) opacity--;
    return opacity;
}