/*
Handles player input and the playfield
*/
$(document).ready(function () {
    $('#catchField').css('height', '100%');
    canvas = document.getElementById("catchField");
    context = canvas.getContext("2d");

    if (window.innerHeight > window.innerWidth) {
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerWidth / 1.63;
    } else {
        context.canvas.height = window.innerHeight - 57;
        context.canvas.width = (window.innerHeight - 57) * 1.63;
    }
    playStartAnim()
    scaleModifier = context.canvas.width / 1400; //all values are based on 1400x855 grid
    grid = 5;
    catcherSpeed = 5 * scaleModifier;
    fruitSpeed = 0.035 * scaleModifier;
    var lastTime = Date.now();
    fruits = []; //containing all fruits on playfield
    var scoreText;
    score = 0; //total score catched, affected by combo
    misses = 0; //missed score (not affected by combo, to get acc)
    catches = 0; //catched score (not affected by combo, to get ac)
    kiai = false; //whether kiai mode is active or not (makes catcher happy)
    combo = 0; //current user combo
    highestCombo = 0;
    bananaShower = false; //whether a banana shower is active

    touching = false; //whether the user is touching the screen or not (for mobile controls)
    touching_x = 0; //where the user is touching

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
        x: canvas.width / 2.5, //middle of playfield
        y: canvas.height * 0.768, //makes catcher's feet touch the ground
        width: (612 / 3) * scaleModifier,
        height: (609 / 3) * scaleModifier,

        //velocity
        dy: 0
    };

    // Calculates the factor by which something moved in a time sensitive manner
    // Scaled relative to 144hz
    function calculateRelativeSpeed(msLast, msNow) {
        return (msNow - msLast) / (1000 / 144);
    }

    // game loop
    function loop() {
        let relativeSpeedMultiplier = calculateRelativeSpeed(lastTime, Date.now());
        lastTime = Date.now();
        requestAnimationFrame(loop);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // add gravity to fruits 
        fruits.forEach(fruit => {
            fruit.updatePos(relativeSpeedMultiplier);
            fruit.checkCollision();
        });

        // prevent catcher from leaving playfield
        if (catcher.x < grid) {
            catcher.x = grid;
        } else if (catcher.x > canvas.width - grid - catcher.width) {
            catcher.x = canvas.width - grid - catcher.width;
        }

        //draw catcher
        context.drawImage(catcherImage, catcher.x, catcher.y, catcher.width, catcher.height);

        //move catcher
        if (keyState[37] || keyState[65] || keyState[103] || (touching && touching_x <= context.canvas.width / 2)) { //left arrow | a | num7
            catcher.x -= catcherSpeed;
            catcherImage_fail = catcherImage_failL;
            catcherImage_kiai = catcherImage_kiaiL;
            catcherImage_idle = catcherImage_idleL;
        } else if (keyState[39] || keyState[68] || keyState[105] || (touching && touching_x > context.canvas.width / 2)) { //right arrow | d | num9
            catcher.x += catcherSpeed;
            catcherImage_fail = catcherImage_failR;
            catcherImage_kiai = catcherImage_kiaiR;
            catcherImage_idle = catcherImage_idleR;
        }
        //dash catcher
        if (keyState[16] || keyState[220]) { //shift | §
            catcherSpeed = 10 * scaleModifier * relativeSpeedMultiplier;
        } else {
            catcherSpeed = 5 * scaleModifier * relativeSpeedMultiplier;
        }

        //update catcher expression based on kiai/fail
        if (lastMiss) {
            catcherImage = catcherImage_fail;
        } else {
            if (kiai) catcherImage = catcherImage_kiai;
            else catcherImage = catcherImage_idle;
        }

        //draw walls
        context.fillStyle = '#0000003D';
        context.fillRect(0, 0, canvas.width, grid);
        context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

        //update score
        scoreText.text = `Accuracy: ${misses == 0 ? "100%" : `${(catches/(catches+misses)*100).toFixed(2)}%`}  Score: ${cleanNumber(Math.round(score))}  Combo: ${cleanNumber(combo)}`;
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
    $(document).on('touchmove', function (e) {
        touching_x = e.originalEvent.touches[0].pageX;
        touching = true;
    })
    $(document).on('touchstart', function (e) {
        touching_x = e.originalEvent.touches[0].pageX;
        touching = true;
    })
    $(document).on('touchend', function (e) {
        touching = false;
    })

    requestAnimationFrame(loop);

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
                context.font = `${30*scaleModifier}px Verdana`;
                context.fillStyle = color;
                context.fillText(this.text, this.x, this.y);
            } else {
                context.fillStyle = color;
                context.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    scoreText = new component("30px", "Public-Sans", "white", 30 * scaleModifier, 50 * scaleModifier, "text");
});

function playStartAnim() {

    var i = 90;

    function myLoop() {
        setTimeout(function () {
            $('#catchField').css('transform', `rotateX(${i}deg) scaleX(${1/i})`)
            if (fruits.length > 0) return;
            i--;
            if (i > 0) {
                myLoop();
            }
        }, 8-i/7)
    }
    myLoop();

}