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
    scaleModifier = context.canvas.width / 1400; //all values are based on 1400x855 grid
    grid = 5;
    catcherSpeed = 5 * scaleModifier;
    fruitSpeed = 0.035 * scaleModifier;
    //2 if catcher takes hyper fruit
    hyperSpeedModifier = 1;
    var lastTime = Date.now();
    allFruits = [];
    summonedFruits = []; //containing all fruits on playfield
    var scoreText;
    score = 0; //total score catched, affected by combo
    missedScore = 0; //missed score (not affected by combo, to get acc)
    catchedScore = 0; //catched score (not affected by combo, to get acc)
    missedFruits = 0;
    catchedFruits = 0;
    kiai = false; //whether kiai mode is active or not (makes catcher happy)
    combo = 0; //current user combo
    highestCombo = 0;
    hasMoved = false;
    gameStarted = false;
    smile = false; //whether the catcher should smile (for the intro)

    touching = false; //whether the user is touching the screen or not (for mobile controls)
    touching_x = 0; //where the user is touching

    loadAssets();

    catcher = {
        x: scaleModifier * 400, //middle of playfield
        y: canvas.height * 0.768, //makes catcher's feet touch the ground
        originalWidth: (516 / 2.5) * scaleModifier,
        originalHeight: (609 / 2.5) * scaleModifier,

        //velocity
        dy: 0
    };

    //using cached values to not mess with CS
    catcher.width= catcher.originalWidth;
    catcher.height = catcher.originalHeight;

    flashlight = {
        y: catcher.y * 0.5 - context.canvas.height,
        width: context.canvas.width * 2,
        height: (context.canvas.width * 2) / (16 / 9)
    }

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
        summonedFruits.forEach(fruit => {
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
        context.globalAlpha = 1;
        if (activeMods.includes("fl"))
            context.drawImage(flashlightImage, catcher.x - context.canvas.width + catcher.width * 0.5, flashlight.y, flashlight.width, flashlight.height);
        context.drawImage(catcherImage, catcher.x, catcher.y, catcher.width, catcher.height);

        //move catcher
        if (keyState[37] || keyState[65] || keyState[103] || (touching && touching_x <= context.canvas.width / 2)) { //left arrow | a | num7
            hasMoved = true;
            catcher.x -= catcherSpeed * hyperSpeedModifier;
            catcherImage_fail = catcherImage_failL;
            catcherImage_kiai = catcherImage_kiaiL;
            catcherImage_idle = catcherImage_idleL;
        } else if (keyState[39] || keyState[68] || keyState[105] || (touching && touching_x > context.canvas.width / 2)) { //right arrow | d | num9
            hasMoved = true;
            catcher.x += catcherSpeed * hyperSpeedModifier;
            catcherImage_fail = catcherImage_failR;
            catcherImage_kiai = catcherImage_kiaiR;
            catcherImage_idle = catcherImage_idleR;
        }
        //dash catcher
        if (keyState[16] || keyState[220]) { //shift | §
            catcherSpeed = 10 * scaleModifier * relativeSpeedMultiplier * hyperSpeedModifier * dtModifier;
        } else {
            catcherSpeed = 5 * scaleModifier * relativeSpeedMultiplier * hyperSpeedModifier * dtModifier;
        }

        //update catcher expression based on kiai/fail
        if (lastMiss) {
            catcherImage = catcherImage_fail;
        } else {
            if (kiai || smile) catcherImage = catcherImage_kiai;
            else catcherImage = catcherImage_idle;
        }

        //draw walls
        context.fillStyle = '#0000003D';
        context.fillRect(0, 0, canvas.width, grid);
        context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

        //update scores
        accText.text = `${missedScore == 0 ? "100%" : `${(catchedScore/(catchedScore+missedScore)*100).toFixed(2)}%`}`;
        scoreText.text = pad(Math.round(score), 7);
        comboText.text = `x${cleanNumber(combo)}`;

        accText.update()
        scoreText.update()
        comboText.update()
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

    comboText = new component(25, "Public-Sans", "#CFF9FA", 840 * scaleModifier, 60 * scaleModifier, "text", "left");
    scoreText = new component(55, "Public-Sans", "#CFF9FA", 700 * scaleModifier, 60 * scaleModifier, "text", "center");
    accText = new component(25, "Public-Sans", "#CFF9FA", 560 * scaleModifier, 60 * scaleModifier, "text", "right");
});

function component(width, height, color, x, y, type, align) {
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
            context.font = `${width*scaleModifier}px Verdana`;
            context.textAlign = align;
            context.fillStyle = color;
            context.fillText(this.text, this.x, this.y);
            context.shadowOffsetX = 5;
            context.shadowOffsetY = 3;
            context.shadowBlur = 2;
            context.shadowColor = "rgba(0, 0, 0, 0.5)";
        } else {
            context.fillStyle = color;
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

function loadAssets() {
    flashlightImage = document.getElementById('catcher-flashlight');
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
    fruitImages = [document.getElementById('fruit1'), document.getElementById('fruit2'), document.getElementById('fruit3'), document.getElementById('fruit4')];
    dropletImage = document.getElementById('droplet');
    bananaImage = document.getElementById('banana');
    hyperImage = document.getElementById('hyper');
}


function startConfetti(side) {
    fire(0.25, {
        spread: 46,
        startVelocity: 55,
    }), side;
    fire(0.2, {
        spread: 60,
    }, side);
    fire(0.35, {
        spread: 120,
        decay: 0.91,
        scalar: 0.8
    }, side);
    fire(0.1, {
        spread: 140,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    }, side);
    fire(0.1, {
        spread: 140,
        startVelocity: 45,
    }, side);
}

var count = 300;
var defaultL = {
    origin: {
        x: 0,
        y: 0.85
    },
};
var defaultR = {
    origin: {
        x: 1,
        y: 0.85
    },
};

function fire(particleRatio, opts, side) {
    confettiCannon(Object.assign({}, side ? defaultL : defaultR, opts, {
        particleCount: Math.floor(count * particleRatio)
    }));
}

function setBackground(path) {
    document.getElementById('catchField').style.background = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('${path}')`;
    document.getElementById('catchField').style.backgroundSize = `cover`;
    document.getElementById('catchField').style.backgroundRepeat = `no-repeat`;
    document.getElementById('catchField').style.backgroundPosition = `center center`;
}