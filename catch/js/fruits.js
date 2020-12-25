function fruit(x, id, large) {
    this.id = id;
    //x goes from 0 to 1120
    this.x = x;
    this.y = 5;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = fruitSpeed;
    this.gravitySpeed = 0;
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
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
    }
    this.update = function () {
        context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
    this.checkCollision = function () {
        if(this.x == 10000) return;
        if (collides(this, catcher)) {
            console.log("Player collected fruit")
            this.x = 10000;
            catches++;
        }
        if (this.y > 900 && this.x != 10000) {
            console.log("Player missed fruit")
            this.x = 10000;
            misses++;
        }
    }
}


summonFruit(0, 500, true);
summonFruit(2000, 500, true);
summonFruit(6400, 0, true);
//double double bool
function summonFruit(delay, pos, large) {
    setTimeout(function () {
        if (large)
            fruits.push(new fruit(pos, fruits.length, large))
    }, delay);
}

function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}