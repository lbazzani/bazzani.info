// ======================
// UTILITY FUNCTIONS
// ======================

import { getRandomInt } from './basesk';

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

let singleMode = true; // All birds use same mode
let globalMode = 1; // Drawing mode (1-4)
const NUM_MODES = 4;

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
    singleMode = getRandomInt(0, 1) === 1;
    globalMode = getRandomInt(1, NUM_MODES);

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
    p5.frameRate(FRAME_RATE);
}

// ======================
// MAIN SKETCH
// ======================

export const circleart = (p5) => {
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
        const stopThreshold = birds.length * getRandomInt(5, 20) / 100;

        for (let i = 0; i < birdsCount; i++) {
            drawnCount += birds[i].draw(p5);
        }

        // Signature
        p5.noStroke();
        p5.fill(255, 255);
        p5.textSize(12);
        p5.text("@bazzani", canvasWidth - 80, canvasHeight - 10);

        // Stop when drawn count drops below threshold
        if (drawnCount < stopThreshold) {
            p5.text("Click to repaint", 10, 20);
            p5.noLoop();
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
        // Circular motion parameters
        this.radius = Math.min(canvasWidth, canvasHeight) / getRandomInt(20, 100);
        this.angle = getRandomInt(0, Math.PI * 200) / 100;
        this.direction = getRandomInt(0, 1) ? -1 : 1;
        this.step = this.radius / getRandomInt(0.001, 0.9);

        // Drawing mode: 1=point, 2=line, 3=ellipse, 4=geometric
        this.mode = singleMode ? globalMode : getRandomInt(1, NUM_MODES);
        this.ellipseRadius1 = getRandomInt(1, 4);
        this.ellipseRadius2 = getRandomInt(1, 4);

        // Position
        this.x = getRandomInt(1, canvasWidth - 1);
        this.y = getRandomInt(1, canvasHeight - 1);
        this.x1 = null; // Previous x for geometric mode
        this.y1 = null; // Previous y for geometric mode

        // Random color
        this.r = getRandomInt(40, 255);
        this.g = getRandomInt(10, 255);
        this.b = getRandomInt(10, 255);
        this.alpha = getRandomInt(10, 255);
    }

    draw(p5) {
        // Calculate next position in circular motion
        const newAngle = this.angle + (this.direction * this.step);
        let nx = this.x + p5.round(this.radius * Math.cos(newAngle));
        let ny = this.y + p5.round(this.radius * Math.sin(newAngle));

        // Wrap around edges if cross mode is enabled (only for point mode)
        if (cross && this.mode === 1) {
            if (nx >= canvasWidth) nx = nx - canvasWidth;
            if (nx <= 0) nx = canvasWidth - nx;
            if (ny >= canvasHeight) ny = ny - canvasHeight;
            if (ny <= 0) ny = canvasHeight - ny;
        }

        let drawn = 0;

        // Draw if the next position is valid and not already drawn
        if (nx > 0 && nx < canvasWidth && ny > 0 && ny < canvasHeight && points[nx][ny] === 0) {
            this.angle = newAngle;
            p5.stroke(this.r, this.g, this.b, this.alpha);

            switch (this.mode) {
                case 1: // Point mode
                    p5.point(nx, ny);
                    break;
                case 2: // Line from center mode
                    p5.line(this.x, this.y, nx, ny);
                    break;
                case 3: // Ellipse mode
                    p5.noStroke();
                    p5.fill(this.r, this.g, this.b, this.alpha);
                    p5.ellipse(nx, ny, this.ellipseRadius1, this.ellipseRadius2);
                    break;
                case 4: // Geometric mode (connect consecutive points)
                    if (this.x1 && this.y1) {
                        p5.line(this.x1, this.y1, nx, ny);
                    }
                    this.x1 = nx;
                    this.y1 = ny;
                    break;
            }

            points[nx][ny] = 1;
            drawn++;
        } else {
            // Change direction and adjust radius
            this.direction = getRandomInt(0, 1) ? -1 : 1;
            this.radius = this.radius + this.direction;

            // Adjust alpha
            if (this.alpha > 10 && this.alpha < 255) {
                this.alpha = this.alpha + this.direction;
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
