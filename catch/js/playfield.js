$(document).ready(function () {
    const canvas = document.getElementById("catchField");
    const context = canvas.getContext("2d");
    const grid = 5;
    const catcherWidth = 612 / 3;
    const catcherHeight = 640 / 3;
    const maxCatcherX = canvas.width - grid - catcherWidth;
    var catcherSpeed = 6;
    var fruitSpeed = 6;
    var lastTime = Date.now();

    const catcherImage = document.getElementById('catcher');
    const fruits = [document.getElementById('fruit1'), document.getElementById('fruit2'), document.getElementById('fruit3')];
    const droplet = document.getElementById('droplet');

    const catcher = {
        x: 0,
        y: canvas.height * 0.77,
        width: catcherWidth,
        height: catcherHeight,

        //velocity
        dy: 0
    };
    const fruit = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: grid,
        height: grid
    };

    // check for collision between two objects using axis-aligned bounding box (AABB)
    // @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    function collides(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
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

        // move catcher by velocity
        catcher.x += catcher.dy * relativeSpeedMultiplier;

        // prevent paddles from going through walls
        if (catcher.x < grid) {
            catcher.x = grid;
        } else if (catcher.x > maxCatcherX) {
            catcher.x = maxCatcherX;
        }

        //draw catcher
        context.fillStyle = 'white';
        context.drawImage(catcherImage, catcher.x, catcher.y, catcher.width, catcher.height);


        // draw walls
        context.fillStyle = '#0000003D';
        context.fillRect(0, 0, canvas.width, grid);
        context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
    }

    //Player movements
    document.addEventListener('keydown', function (e) {

        // up arrow key
        if (e.which === 37) {
            catcher.x -= 15;
        }
        // down arrow key
        else if (e.which === 39) {
            catcher.x += 15;
        }
    })
    requestAnimationFrame(loop);

    //double double bool
    function summonFruit(delay, pos, large) {
        setTimeout(function () {
            if (large)
                context.drawImage(sauce, leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
        }, delay);
    }
});