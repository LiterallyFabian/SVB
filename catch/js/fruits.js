/*
    Handles fruit gravity and collissions
*/
lastMiss = false;

stats_bananasSeen = 0;
stats_bananasCatched = 0;

function fruit(x, id, size, hitsound) {
    this.id = id;
    //x goes from 0 to 1120
    this.x = x;
    this.y = -100 * scaleModifier;
    this.speedX = 0;
    this.speedY = 5;
    this.hitsound = -1;
    this.size = size;
    this.score = 0;
    if (size == 0) { //normal fruit
        this.sprite = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        this.width = 80 * scaleModifier;
        this.height = 80 * scaleModifier;
        this.hitsound = hitsound;
        this.score = 300;
    } else if (size == 1) { //droplet
        this.sprite = dropletImage;
        this.width = 41 * scaleModifier;
        this.height = 51 * scaleModifier;
        this.score = 50;
    } else if (size == 2) { //banana
        this.sprite = bananaImage;
        this.width = 70 * scaleModifier;
        this.height = 70 * scaleModifier;
        this.score = 1000;
    }
    context.drawImage(this.sprite, this.x, this.y, this.width, this.height);

    this.updatePos = function () {
        this.y += this.speedY * scaleModifier;
        context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
    this.checkCollision = function () {
        if (this.x == 10000) return;
        //catch
        if (collides(this, catcher)) {
            this.x = 10000;
            lastMiss = false;
            //Add score
            if (this.size != 2) {
                smoothAcc(this.score, false);
                addScore(this.score + (this.score * ((combo - (combo != 0 ? 0 : combo - 1)) / 25)));
            }
            if (this.size == 0) {
                combo++;
                if(combo>highestCombo) highestCombo = combo;

            }
            if (this.size == 2) {
                addScore(this.score);
                stats_bananasCatched++;
            }

            //Play hitsound
            if (this.hitsound == -1 || this.hitsound == undefined) return;
            //clap
            else if (this.hitsound == 8 || this.hitsound == 10 || this.hitsound == 12 || this.hitsound == 14) {
                hitsounds[3].currentTime = 0;
                hitsounds[3].play();
            } //finish
            else if (this.hitsound == 4 || this.hitsound == 6 || this.hitsound == 12 || this.hitsound == 14) {
                hitsounds[2].currentTime = 0;
                hitsounds[2].play();
            } //whistle
            else if (this.hitsound == 2 || this.hitsound == 6 || this.hitsound == 10 || this.hitsound == 14) {
                hitsounds[1].currentTime = 0;
                hitsounds[1].play();
            } //normal
            else if (this.hitsound == 0) {
                hitsounds[0].currentTime = 0;
                hitsounds[0].play();
            }

        } //miss
        else if (this.y > 900 * scaleModifier && this.x != 10000 && !isNaN(this.x)) {
            //console.log(`missed [${this.size}] with x ${this.x} sprite ${this.sprite} score ${this.score}`)
            this.x = 10000;
            if (this.size != 2) {
                smoothAcc(this.score, true);
                lastMiss = true;
            }
            if (this.size == 0) combo = 0;
        }

    }
}

function smoothAcc(addedscore, isMiss) {
    var i = 0; //  set your counter to 1

    function Loop() { //  create a loop function
        setTimeout(function () { //  call a 3s setTimeout when the loop is called
            if (isMiss) misses += addedscore / 25;
            else catches += addedscore / 25;
            i++;
            if (i < 25) {
                Loop();
            }
        }, 18)
    }

    Loop();
}

function addScore(addedscore) {
    var i = 0; //  set your counter to 1

    function Loop() { //  create a loop function
        setTimeout(function () { //  call a 3s setTimeout when the loop is called
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