spinner = false;
$(document).ready(function () {
    $('#catchField').css('height', '100%');
    canvas = document.getElementById("catchField");
    context = canvas.getContext("2d");
    context.canvas.height = window.innerHeight - document.getElementById('navbar').clientHeight;
    context.canvas.width = (window.innerHeight - document.getElementById('navbar').clientHeight) * 1.63;
    scaleModifier = context.canvas.width / 1400; //all values are based on 1400x855 grid
    grid = 5;
    catcherWidth = (612 / 3) * scaleModifier;
    catcherHeight = (609 / 3) * scaleModifier;
    maxCatcherX = canvas.width - grid - catcherWidth;
    catcherSpeed = 5 * scaleModifier;
    fruitSpeed = 0.035 * scaleModifier;
    lastTime = Date.now();
    fruits = [];
    var scoreText;
    score = 0;
    misses = 0;
    catches = 0;
    kiai = false;
    combo = 0;
    touching = false;
    touching_x = 0;

    catcherImage_idleL = document.getElementById('catcher-idleL');
    catcherImage_kiaiL = document.getElementById('catcher-kiaiL');
    catcherImage_failL = document.getElementById('catcher-failL');
    catcherImage_idleR = document.getElementById('catcher-idleR');
    catcherImage_kiaiR = document.getElementById('catcher-kiaiR');
    catcherImage_failR = document.getElementById('catcher-failR');

    catcherImage_fail = catcherImage_failR;
    catcherImage_kiai = catcherImage_kiaiR;
    catcherImage_idle = catcherImage_idleR;
    catcherImage = catcherImage_idle;
    fruitImages = [document.getElementById('fruit1'), document.getElementById('fruit2'), document.getElementById('fruit3')];
    dropletImage = document.getElementById('droplet');
    bananaImage = document.getElementById('banana');


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
        if (this.type != "text") {
            this.width = width * scaleModifier;
            this.height = height * scaleModifier;
        }
        this.speedX = 0;
        this.speedY = 0;
        this.x = x;
        this.y = y;
        this.update = function () {
            if (this.type == "text") {
                context.font = `${30*scaleModifier}px Consolas`;
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
        if (keyState[37] || keyState[65] || keyState[103] || (touching && touching_x <= window.innerHeight/2)) { //left arrow | a | num7
            catcher.x -= catcherSpeed;
            catcherImage_fail = catcherImage_failL;
            catcherImage_kiai = catcherImage_kiaiL;
            catcherImage_idle = catcherImage_idleL;
        } else if (keyState[39] || keyState[68] || keyState[105] || (touching && touching_x > window.innerHeight/2)) { //right arrow | d | num9
            catcher.x += catcherSpeed;
            catcherImage_fail = catcherImage_failR;
            catcherImage_kiai = catcherImage_kiaiR;
            catcherImage_idle = catcherImage_idleR;
        }
        //dash catcher
        if (keyState[16] || keyState[220]) { //shift or §
            catcherSpeed = 10 * scaleModifier;
        } else {
            catcherSpeed = 5 * scaleModifier;
        }

        // draw walls
        context.fillStyle = '#0000003D';
        context.fillRect(0, 0, canvas.width, grid);
        context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
        scoreText.text = `Accuracy: ${misses == 0 ? "100%" : `${Math.round(catches/(catches+misses)*100)}%`}  Score: ${score}  Combo: ${combo}`;
        scoreText.update()



    }

    //Detect movement input
    var keyState = {};
    window.addEventListener('keydown', function (e) {
        keyState[e.keyCode || e.which] = true;
    }, true);
    window.addEventListener('keyup', function (e) {
        keyState[e.keyCode || e.which] = false;
    }, true);
    $(document).mousedown(function (e) {
        if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            touching_x = touch.pageX;
            if(e.type == 'touchstart' || e.type =="touchmove") touching = true;
            else touching = false;
            console.log("a")
        } else if (e.type == 'mousedown') {
            touching_x = e.clientX;
            touching = true;
        }
       
    })
    $(document).mouseup(function(e){
        touching = false;
    })


    requestAnimationFrame(loop);

    scoreText = new component("30px", "Public-Sans", "white", 30 * scaleModifier, 50 * scaleModifier, "text");

});