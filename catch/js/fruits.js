function fruit(x, id, large) {
    this.id = id;
    //x goes from 0 to 1120
    this.x = x;
    this.y = -100;
    this.speedX = 0;
    this.speedY = 5;
    if (large) {
        this.sprite = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        this.width = 80;
        this.height = 80;
    } else {
        this.sprite = dropletImage;
        this.width = 41;
        this.height = 51;
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
        //catch
        if (collides(this, catcher)) {
            if (kiai) catcherImage = catcherImage_kiai;
            else catcherImage = catcherImage_idle;
            this.x = 10000;
            catches++;


        } //miss
        else if (this.y > 900 && this.x != 10000) {
            catcherImage = catcherImage_fail;
            this.x = 10000;
            misses++;
        }
    }
}




//double double bool
function summonFruit(delay, pos, large) {
    setTimeout(function () {
        fruits.push(new fruit(pos * 1.75, fruits.length, large))
        t0 = performance.now()
    }, parseInt(delay, 10) - 955);
}

function toggleKiai(kiaiOn, delay) {
    setTimeout(function () {
        kiai = kiaiOn;
        console.log("toggled kiai" + delay)
    }, parseInt(delay, 10));
}

function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}