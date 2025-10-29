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

    // Calculate canvas dimensions - use available space
    const availableWidth = p5.windowWidth;
    const availableHeight = p5.windowHeight;

    // Use the smaller dimension to create a square-ish canvas
    const size = Math.min(availableWidth, availableHeight);
    canvasWidth = p5.round(size * scaleWidth);
    canvasHeight = p5.round(size * scaleHeight);

    // Random settings for each scene
    cross = getRandomInt(0, 1) === 1;

    // Calculate bird count based on canvas size
    birdsCount = Math.round((canvasWidth * canvasHeight) / getRandomInt(100, 1000));

    // Initialize birds
    birds = [];
    for (let i = 0; i < birdsCount; i++) {
        birds.push(new Bird());
    }

    // Initialize pixel tracking grid
    points = [...Array(canvasWidth)].map(item => Array(canvasHeight).fill(0));

    canvas = p5.createCanvas(canvasWidth, canvasHeight);
}

// ======================
// MAIN SKETCH
// ======================

export const rectart = (p5) => {
    p5.setup = () => {
        init(p5);
        p5.frameRate(FRAME_RATE);
    };

    p5.draw = () => {
        // Initialize scene on first frame
        if (sceneFrame === -1) {
            // Random dark background
            const bgGray = getRandomInt(10, 50);
            p5.background(bgGray);
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

        // Auto-restart when all pixels are drawn
        if (drawnCount === 0) {
            p5.noLoop();
            setTimeout(() => {
                init(p5);
                p5.loop();
            }, 10000);
        }
    };

    p5.windowResized = () => {
        const availableWidth = p5.windowWidth;
        const availableHeight = p5.windowHeight;
        const size = Math.min(availableWidth, availableHeight);
        canvasWidth = p5.round(size * scaleWidth);
        canvasHeight = p5.round(size * scaleHeight);
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
        this.dx = getRandomInt(-1, 1);
        this.dy = getRandomInt(-1, 1);

        // Random color
        this.r = getRandomInt(40, 255);
        this.g = getRandomInt(10, 255);
        this.b = getRandomInt(10, 255);
        this.alpha = getRandomInt(200, 255);
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

        // Draw if the next position is valid and not near other pixels
        if (nx > 0 && nx < canvasWidth && ny > 0 && ny < canvasHeight && !isNear(nx, ny, 1)) {
            this.x = nx;
            this.y = ny;
            p5.stroke(this.r, this.g, this.b, this.alpha);
            p5.point(nx, ny);
            points[nx][ny] = 1;
            drawn++;
        } else {
            // Change direction randomly
            this.dx = getRandomInt(-1, 1);
            this.dy = getRandomInt(-1, 1);
        }

        return drawn;
    }
}

// ======================
// UTILITY FUNCTION
// ======================

const isNear = (x, y, distance) => {
    // Check if any pixel within distance is already drawn
    for (let xn = x - distance; xn <= x + distance; xn++) {
        for (let yn = y - distance; yn <= y + distance; yn++) {
            if (xn >= 0 && xn < canvasWidth && yn >= 0 && yn < canvasHeight && points[xn][yn]) {
                return true;
            }
        }
    }
    return false;
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
