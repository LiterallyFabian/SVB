lastMiss = false;

function fruit(x, id, size, hitsound) {
    this.id = id;
    //x goes from 0 to 1120
    this.x = x;
    this.y = -100;
    this.speedX = 0;
    this.speedY = 5;
    this.hitsound = -1;
    if (size == 0) { //normal fruit
        this.sprite = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        this.width = 80;
        this.height = 80;
        this.hitsound = hitsound;
    } else if (size == 1) { //droplet
        this.sprite = dropletImage;
        this.width = 41;
        this.height = 51;
    } else if (size == 2) { //banana
        this.sprite = bananaImage;
        this.width = 70;
        this.height = 70;
    }
    context.drawImage(this.sprite, this.x, this.y, this.width, this.height);

    this.newPos = function () {
        this.y += this.speedY;
    }
    this.update = function () {
        context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
    this.checkCollision = function () {
        if (this.x == 10000) return;

        if (lastMiss) {
            catcherImage = catcherImage_fail;
        } else {
            if (kiai) catcherImage = catcherImage_kiai;
            else catcherImage = catcherImage_idle;
        }
        //catch
        if (collides(this, catcher)) {
            this.x = 10000;
            lastMiss = false;
            if (this.size != 2) {
                catches++;
            }
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
            } else console.log("FUCK " + this.hitsound)
            console.log("PLAY");
        } //miss
        else if (this.y > 900 && this.x != 10000) {

            this.x = 10000;
            if (this.size != 2) {
                misses++;
                lastMiss = true;
            }
        }
    }
}




//double double bool
function summonFruit(delay, pos, size, hitsound) {
    setTimeout(function () {
        fruits.push(new fruit(pos * 1.75, fruits.length, size, hitsound))
    }, parseInt(delay, 10) - 955);
}

//double double bool
function summonSpinner(start, stop) {
    setTimeout(function () {
        spinner = true;
    }, parseInt(start, 10) - 955);
    setTimeout(function () {
        spinner = false;
    }, parseInt(stop, 10) - 955);
}

function toggleKiai(kiaiOn, delay) {
    setTimeout(function () {
        kiai = kiaiOn;
        console.log("toggled kiai" + delay)
    }, parseInt(delay, 10));
}
window.setInterval(function () {
    if (spinner) fruits.push(new fruit(Math.floor(Math.random() * 1000) + 20, fruits.length, 2));
}, 60);

function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}