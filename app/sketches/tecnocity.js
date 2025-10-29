// ======================
// UTILITY FUNCTIONS
// ======================

function getRandomInt(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ======================
// STATE VARIABLES
// ======================

let canvas;
let canvasWidth;
let canvasHeight;
const scaleWidth = 1.0;
const scaleHeight = 0.92;

let sceneFrame = -1;
const FRAME_RATE = 60;

let birds = [];
let birdsCount = 10000;
let points; // Grid to track drawn pixels
let cross = true; // Wrap around edges

let directionMode = 3;
let scene = null;


// ======================
// INITIALIZATION
// ======================

const init = (p5) => {
    // Reset global variables
    canvas = null;
    birds = [];
    points = null;
    scene = null;
    sceneFrame = -1;

    // Calculate canvas dimensions
    canvasHeight = p5.round(window.innerHeight * scaleHeight);
    canvasWidth = p5.round(window.innerWidth * scaleWidth);

    // Random settings for each scene
    cross = getRandomInt(0, 1) === 1;
    directionMode = getRandomInt(1, 3);

    // Calculate bird count based on canvas size
    birdsCount = Math.round((canvasWidth * canvasHeight) / getRandomInt(100, 1000));

    if (directionMode === 3) {
        // Full direction mode needs fewer birds
        birdsCount = Math.round(birdsCount / 10);
    }

    // Initialize birds
    birds = [];
    for (let i = 0; i < birdsCount; i++) {
        birds.push(new Bird());
    }

    // Initialize pixel tracking grid
    points = [...Array(canvasWidth)].map(item => Array(canvasHeight).fill(0));

    canvas = p5.createCanvas(canvasWidth, canvasHeight);
    p5.frameRate(FRAME_RATE);
}

// ======================
// MAIN SKETCH
// ======================

export const tecnocity = (p5) => {
    p5.setup = () => {
        init(p5);
    };
      
    p5.draw = () => {
        // Initialize scene on first frame
        if (sceneFrame === -1) {
            p5.background(getRandomInt(10, 50), getRandomInt(100, 200));
            scene = new Scene();
        }

        scene && scene.draw(p5);

        // Draw all birds and count how many successfully drew
        let drawnCount = 0;
        for (let i = 0; i < birdsCount; i++) {
            drawnCount += birds[i].draw(p5);
        }

        // Signature
        p5.noStroke();
        p5.fill(255, 255);
        p5.textSize(12);
        p5.text("@bazzani", canvasWidth - 80, canvasHeight - 10);

        // Stop when all pixels are drawn
        if (drawnCount === 0) {
            p5.noLoop();
            p5.text("Click to repaint", 10, 20);
        }
    };

    p5.touchStarted = () => {
        if (p5.mouseY > 0 && p5.mouseY < canvasHeight) {
            init(p5);
            p5.loop();
            return false;
        }
    };

    p5.mousePressed = () => {
        if (p5.mouseY > 0 && p5.mouseY < canvasHeight) {
            init(p5);
            p5.loop();
            return false;
        }
    };

    p5.windowResized = () => {
        canvasHeight = p5.windowHeight * scaleHeight;
        canvasWidth = p5.windowWidth * scaleWidth;
        canvas = canvas ? p5.resizeCanvas(canvasWidth, canvasHeight) : p5.createCanvas(canvasWidth, canvasHeight);
    };
};

// ======================
// BIRD CLASS
// ======================

class Bird {
    constructor() {
        this.x = getRandomInt(1, canvasWidth - 1);
        this.y = getRandomInt(1, canvasHeight - 1);
        this.dx = 0;
        this.dy = 0;
        this.getDirection();

        // Random color
        this.r = getRandomInt(40, 255);
        this.g = getRandomInt(10, 255);
        this.b = getRandomInt(10, 255);
        this.alpha = getRandomInt(200, 255);
    }

    getDirection() {
        switch (directionMode) {
            case 1: // Oblique (diagonal)
                this.dx = getRandomInt(0, 1) ? -1 : 1;
                this.dy = getRandomInt(0, 1) ? -1 : 1;
                break;
            case 2: // Straight (horizontal/vertical)
                const straightDirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                const straightDir = straightDirs[getRandomInt(0, 3)];
                this.dx = straightDir[0];
                this.dy = straightDir[1];
                break;
            case 3: // Full (all 8 directions)
                const fullDirs = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, -1], [-1, 1]];
                const fullDir = fullDirs[getRandomInt(0, 7)];
                this.dx = fullDir[0];
                this.dy = fullDir[1];
                break;
        }
    }

    draw(p5) {
        let nx = this.x + this.dx;
        let ny = this.y + this.dy;

        // Wrap around edges if cross mode is enabled
        if (cross) {
            if (nx === canvasWidth) nx = 1;
            if (nx === 0) nx = canvasWidth - 1;
            if (ny === canvasHeight) ny = 1;
            if (ny === 0) ny = canvasHeight - 1;
        }

        let drawn = 0;

        // Draw if the next position is valid and not already drawn
        if (nx > 0 && nx < canvasWidth && ny > 0 && ny < canvasHeight && points[nx][ny] === 0) {
            this.x = nx;
            this.y = ny;
            p5.stroke(this.r, this.g, this.b, this.alpha);
            p5.point(nx, ny);
            points[nx][ny] = 1;
            drawn++;
        } else {
            // Change direction and fade out
            this.getDirection();
            if (this.alpha > 10) {
                this.alpha = this.alpha - 0.5;
            }
        }

        return drawn;
    }
}

// ======================
// SCENE CLASS
// ======================

class Scene {
    constructor() {
        // Random parameters for potential future animations
        this.rnd1 = getRandomInt(40, 100) / 100;
        this.rnd2 = getRandomInt(10, 100) / 100;
        this.rnd3 = getRandomInt(10, 100) / 100;
        this.rnd4 = getRandomInt(10, 100) / 100;
        this.rnd5 = getRandomInt(10, 100) / 100;
    }

    draw(p5) {
        // Increment scene frame counter
        sceneFrame++;
    }
}
