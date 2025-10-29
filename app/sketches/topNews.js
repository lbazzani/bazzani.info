import moment from 'moment';

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
const SCENE_DURATION = 10; // seconds
const FRAME_RATE = 10;

// Layout proportions for professional news agency style
const HEADER_HEIGHT = 0.08;    // 8% for header bar
const IMAGE_HEIGHT = 0.52;     // 52% for image
const TEXT_HEIGHT = 0.40;      // 40% for text content

let currentNews = null;
let currentImage = null;
let scene = null;
let newsData = null;

const SERVER_URL = "https://cdn.bazzani.info/news";

// ======================
// NEWS FETCHING
// ======================

const fetchNews = async () => {
    const url = SERVER_URL + "/topnews.json";
    console.log("Fetching news from:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        newsData = await response.json();
        console.log("News loaded:", newsData.length, "items");
    } catch (error) {
        console.error("Error fetching news:", error);
        // Fallback to mock data if fetch fails
        newsData = [{
            title: "Unable to load news",
            description: "Please check your internet connection or the news server may be unavailable.",
            domain: "System",
            postdate: new Date().toISOString(),
            local_image: ""
        }];
    }
}

// ======================
// MAIN SKETCH
// ======================

export const topNews = (p5) => {
    p5.setup = async () => {
        // Reset global variables
        canvas = null;
        scene = null;
        currentNews = null;
        currentImage = null;
        sceneFrame = -1;

        canvasHeight = p5.round(window.innerHeight * scaleHeight);
        canvasWidth = p5.min(window.innerWidth * scaleWidth, canvasHeight);

        canvas = p5.createCanvas(canvasWidth, canvasHeight);
        p5.frameRate(FRAME_RATE);

        // Fetch news asynchronously
        await fetchNews();
    };

    p5.draw = () => {
        // Load new news item
        if (sceneFrame === -1 || sceneFrame === SCENE_DURATION * FRAME_RATE) {
            p5.noLoop();

            if (!newsData || newsData.length === 0) {
                fetchNews();
            }

            const index = getRandomInt(0, newsData.length - 1);
            currentNews = newsData[index];
            newsData.splice(index, 1); // Remove displayed news

            // Handle image loading with fallback
            const imageUrl = currentNews.local_image ? SERVER_URL + currentNews.local_image : null;

            if (imageUrl) {
                p5.loadImage(
                    imageUrl,
                    (imageLoaded) => {
                        currentImage = imageLoaded;
                        scene = new Scene();
                        sceneFrame = 0;
                        console.log("New scene loaded");
                        p5.loop();
                    },
                    () => {
                        // Image load error - create placeholder
                        console.warn("Failed to load image, using placeholder");
                        currentImage = p5.createImage(400, 300);
                        currentImage.loadPixels();
                        for (let i = 0; i < currentImage.pixels.length; i += 4) {
                            currentImage.pixels[i] = 60;
                            currentImage.pixels[i + 1] = 60;
                            currentImage.pixels[i + 2] = 80;
                            currentImage.pixels[i + 3] = 255;
                        }
                        currentImage.updatePixels();
                        scene = new Scene();
                        sceneFrame = 0;
                        p5.loop();
                    }
                );
            } else {
                // No image URL - create placeholder
                currentImage = p5.createImage(400, 300);
                currentImage.loadPixels();
                for (let i = 0; i < currentImage.pixels.length; i += 4) {
                    currentImage.pixels[i] = 60;
                    currentImage.pixels[i + 1] = 60;
                    currentImage.pixels[i + 2] = 80;
                    currentImage.pixels[i + 3] = 255;
                }
                currentImage.updatePixels();
                scene = new Scene();
                sceneFrame = 0;
                p5.loop();
            }
            return;
        }

        if (scene) {
            scene.draw(p5, sceneFrame);
            sceneFrame++;
        }
    };

    p5.touchStarted = () => {
        if (p5.mouseY > 0 && p5.mouseY < canvasHeight) {
            p5.isLooping() ? p5.noLoop() : p5.loop();
            return false;
        }
    };

    p5.mousePressed = () => {
        if (p5.mouseY > 0 && p5.mouseY < canvasHeight) {
            p5.isLooping() ? p5.noLoop() : p5.loop();
            return false;
        }
    };

    p5.windowResized = () => {
        canvasHeight = p5.windowHeight * scaleHeight;
        canvasWidth = p5.min(p5.windowWidth * scaleWidth, canvasHeight);
        canvas = canvas ? p5.resizeCanvas(canvasWidth, canvasHeight) : p5.createCanvas(canvasWidth, canvasHeight);
    };
};

// ======================
// SCENE CLASS
// ======================

class Scene {
    constructor() {
        // Animation parameters
        this.imageLoaded = false;
    }

    draw(p5, frame) {
        // Calculate animation progress
        const totalFrames = FRAME_RATE * SCENE_DURATION;
        const progress = frame / totalFrames;
        const sinProgress = Math.sin(progress * Math.PI); // Smooth ease

        // Background gradient
        this.drawBackground(p5);

        // Calculate image dimensions
        const imageDimensions = this.calculateImageSize();

        // Draw image with fade-in animation
        this.drawNewsImage(p5, imageDimensions, sinProgress);

        // Draw news text content
        this.drawNewsContent(p5, imageDimensions, progress, sinProgress);
    }

    drawBackground(p5) {
        // Professional white/light gray background
        p5.background(245, 245, 250);
    }

    calculateImageSize() {
        let imageWidth = currentImage.width;
        let imageHeight = currentImage.height;
        const aspectRatio = imageWidth / imageHeight;

        // Image area dimensions
        const imageAreaY = canvasHeight * HEADER_HEIGHT;
        const imageAreaHeight = canvasHeight * IMAGE_HEIGHT;
        const maxWidth = canvasWidth * 0.90; // 90% width with margins

        // Scale to fit within image area
        imageHeight = imageAreaHeight;
        imageWidth = imageHeight * aspectRatio;

        if (imageWidth > maxWidth) {
            imageWidth = maxWidth;
            imageHeight = imageWidth / aspectRatio;
        }

        // Center in image area
        const x = (canvasWidth - imageWidth) / 2;
        const y = imageAreaY + (imageAreaHeight - imageHeight) / 2;

        return { x, y, width: imageWidth, height: imageHeight };
    }

    drawNewsImage(p5, dims, sinProgress) {
        p5.push();

        // Professional shadow
        p5.fill(0, 0, 0, 30 * sinProgress);
        p5.noStroke();
        p5.rect(dims.x + 3, dims.y + 3, dims.width, dims.height, 4);

        // White card background
        p5.fill(255);
        p5.rect(dims.x, dims.y, dims.width, dims.height, 4);

        // Image with fade-in
        p5.tint(255, 255 * sinProgress);
        p5.image(currentImage, dims.x, dims.y, dims.width, dims.height);
        p5.noTint();

        // Clean border
        p5.noFill();
        p5.stroke(220, 220, 220, 255 * sinProgress);
        p5.strokeWeight(1);
        p5.rect(dims.x, dims.y, dims.width, dims.height, 4);

        p5.pop();
    }

    drawNewsContent(p5, dims, progress, sinProgress) {
        // Draw professional header bar
        this.drawHeaderBar(p5, sinProgress);

        // Draw text content area below image
        this.drawTextArea(p5, progress, sinProgress);
    }

    drawHeaderBar(p5, sinProgress) {
        const headerHeight = canvasHeight * HEADER_HEIGHT;
        const padding = 15;

        // Red accent bar (news agency style)
        p5.noStroke();
        p5.fill(220, 38, 38, 255 * sinProgress);
        p5.rect(0, 0, canvasWidth, 4);

        // Header background
        p5.fill(255, 255, 255, 255 * sinProgress);
        p5.rect(0, 4, canvasWidth, headerHeight - 4);

        // "BREAKING NEWS" badge
        p5.push();
        p5.fill(220, 38, 38, 255 * sinProgress);
        p5.rect(padding, headerHeight * 0.25, 120, headerHeight * 0.5, 3);

        p5.textFont('Arial');
        p5.textStyle(p5.BOLD);
        p5.textSize(headerHeight * 0.25);
        p5.fill(255, 255, 255, 255 * sinProgress);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text('BREAKING NEWS', padding + 60, headerHeight * 0.5);
        p5.pop();

        // Source and time
        const postdate = moment(currentNews.postdate).fromNow();
        const source = `${currentNews.domain} • ${postdate}`;

        p5.push();
        p5.textFont('Arial');
        p5.textStyle(p5.NORMAL);
        p5.textSize(headerHeight * 0.22);
        p5.fill(100, 100, 100, 255 * sinProgress);
        p5.textAlign(p5.RIGHT, p5.CENTER);
        p5.text(source, canvasWidth - padding, headerHeight * 0.5);
        p5.pop();

        // Bottom border
        p5.stroke(230, 230, 230, 255 * sinProgress);
        p5.strokeWeight(1);
        p5.line(0, headerHeight, canvasWidth, headerHeight);
    }

    drawTextArea(p5, progress, sinProgress) {
        const textAreaY = canvasHeight * (HEADER_HEIGHT + IMAGE_HEIGHT);
        const textAreaHeight = canvasHeight * TEXT_HEIGHT;
        const padding = 25;

        // White text area background
        p5.noStroke();
        p5.fill(255, 255, 255, 255 * sinProgress);
        p5.rect(0, textAreaY, canvasWidth, textAreaHeight);

        // Title - calculate height first to avoid overlaps
        const title = currentNews.title;
        const titleSize = Math.min(textAreaHeight * 0.12, 24);
        const titleY = textAreaY + padding;

        p5.push();
        p5.textFont('Georgia');
        p5.textStyle(p5.BOLD);
        p5.textSize(titleSize);
        p5.fill(30, 30, 30, 255 * sinProgress);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textWrap(p5.WORD);

        // Measure title height
        const titleLines = this.splitTextIntoLines(p5, title, canvasWidth - padding * 2);
        const titleHeight = titleLines.length * titleSize * 1.2;

        p5.text(
            title,
            padding,
            titleY,
            canvasWidth - padding * 2
        );
        p5.pop();

        // Red accent line - positioned after title
        const lineY = titleY + titleHeight + 10;
        p5.stroke(220, 38, 38, 255 * sinProgress);
        p5.strokeWeight(3);
        p5.line(
            padding,
            lineY,
            padding + 60,
            lineY
        );

        // Description - positioned after line with proper spacing
        const description = currentNews.description;
        const descSize = Math.min(textAreaHeight * 0.08, 15);
        const descY = lineY + 15;
        const descMaxHeight = textAreaY + textAreaHeight - descY - padding;

        p5.push();
        p5.textFont('Georgia');
        p5.textStyle(p5.NORMAL);
        p5.textSize(descSize);
        p5.fill(80, 80, 80, 255 * sinProgress);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textWrap(p5.WORD);
        p5.text(
            description,
            padding,
            descY,
            canvasWidth - padding * 2,
            descMaxHeight
        );
        p5.pop();
    }

    splitTextIntoLines(p5, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = p5.textWidth(testLine);

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }
}
