$(document).ready(function () {
    canvas = document.getElementById("catchField");
    context = canvas.getContext("2d");
    grid = 5;
    catcherWidth = 612 / 3;
    catcherHeight = 640 / 3;
    maxCatcherX = canvas.width - grid - catcherWidth;
    catcherSpeed = 5;
    fruitSpeed = 0.035;
    lastTime = Date.now();
    fruits = [];
    var score;
    misses = 0;
    catches = 0;
    kiai = false;


    catcherImage_idle = document.getElementById('catcher-idle');
    catcherImage_kiai = document.getElementById('catcher-kiai');
    catcherImage_fail = document.getElementById('catcher-fail');
    catcherImage = catcherImage_idle;
    fruitImages = [document.getElementById('fruit1'), document.getElementById('fruit2'), document.getElementById('fruit3')];
    dropletImage = document.getElementById('droplet');

    catcher = {
        x: canvas.width / 2.5,
        y: canvas.height * 0.77,
        width: catcherWidth,
        height: catcherHeight,

        //velocity
        dy: 0
    };

    function component(width, height, color, x, y, type) {
        this.type = type;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.x = x;
        this.y = y;
        this.update = function () {
            if (this.type == "text") {
                context.font = this.width + " " + this.height;
                context.fillStyle = color;
                context.fillText(this.text, this.x, this.y);
            } else {
                context.fillStyle = color;
                context.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    // Calculates the factor by which something moved in a time sensitive manner
    // Scaled relative to 60hz
    // For example 60hz e.g. 0.0166...ms would return 1, 120hz 0.5, 30hz 2
    function calculateRelativeSpeed(msLast, msNow) {
        // time passed since last / 16ms
        return (msNow - msLast) / (1000 / 60);
    }

    // game loop
    function loop() {
        let relativeSpeedMultiplier = calculateRelativeSpeed(lastTime, Date.now());
        lastTime = Date.now();
        requestAnimationFrame(loop);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // add gravity to fruits 
        fruits.forEach(fruit => {
            fruit.newPos();
            fruit.update();
            fruit.checkCollision();
        });

        // prevent paddles from going through walls
        if (catcher.x < grid) {
            catcher.x = grid;
        } else if (catcher.x > maxCatcherX) {
            catcher.x = maxCatcherX;
        }

        //draw catcher
        context.fillStyle = 'white';
        context.drawImage(catcherImage, catcher.x, catcher.y, catcher.width, catcher.height);

        //move catcher
        if (keyState[37] || keyState[65]) {
            catcher.x -= catcherSpeed;
        } else if (keyState[39] || keyState[68]) {
            catcher.x += catcherSpeed;
        }
        if (keyState[16]) {
            catcherSpeed = 10;
        } else {
            catcherSpeed = 5;
        }

        // draw walls
        context.fillStyle = '#0000003D';
        context.fillRect(0, 0, canvas.width, grid);
        context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
        score.text = `Accuracy: ${misses == 0 ? "100%" : `${Math.round(catches/(catches+misses)*100)}%`}`;
        score.update()



    }

    //Player movements
    var keyState = {};
    window.addEventListener('keydown', function (e) {
        keyState[e.keyCode || e.which] = true;
    }, true);
    window.addEventListener('keyup', function (e) {
        keyState[e.keyCode || e.which] = false;
    }, true);


    requestAnimationFrame(loop);

    score = new component("30px", "Consolas", "black", 30, 50, "text");

});