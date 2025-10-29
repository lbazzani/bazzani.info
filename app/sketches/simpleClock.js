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
// QUOTES DATA
// ======================

const quotes = [
    {
        text:"I\'m crazy like a clock", author:"I\'s me, The clock"
    },
    {
        text:"Taking crazy things seriously is a serious waste of time.", author:"Haruki Murakami, Kafka on the Shore"
    },
    {
        text:"A question that sometimes drives me hazy: am I or are the others crazy?", author:"Albert Einstein"
    },
    {
        text:"Being crazy isn\'t enough.", author:"Dr. Seuss"
    },
    {
        text:"When you are crazy you learn to keep quiet.", author:"Philip K. Dick, VALIS"
    },
    {
        text:"Where to look if you've lost your mind?", author:"Bernard Malamud, The Fixer"
    },
    {
        text:"But you are crazy.", author:"You know?"
    },
    {
        text:"Happiness is not the absence of problems, it’s the ability to deal with them.", author:"Steve Maraboli"
    },
    {
        text:"Happiness is not being pained in body or troubled in mind.", author:"Thomas Jefferson"
    },
    {
        text:"The secret of happiness is to find a congenial monotony.", author:"V.S. Pritchett"
    },
    {
        text:"There is only one happiness in this life, to love and be loved.", author:"George Sand"
    },
    {
        text:"Happiness is not an ideal of reason, but of imagination.", author:"Immanuel Kant"
    },
    {
        text:"To be without some of the things you want is an indispensable part of happiness.", author:"Bertrand Russell"
    },
    {
        text:"The secret of happiness is freedom, the secret of freedom is courage.", author:"Carrie Jones"
    },
    {
        text:"It is not how much we have, but how much we enjoy, that makes happiness.", author:"Charles Spurgeon"
    },
    {
        text:"The only way to find true happiness is to risk being completely cut open.", author:"Chuck Palahniuk"
    },
    {
        text:"Nobody really cares if you’re miserable, so you might as well be happy.", author:"Cynthia Nelms"
    },
    {
        text:"Happiness is not something ready made. It comes from your own actions.", author:"Dalai Lama"
    },
    {
        text:"I think the key to life is just being a happy person, and happiness will bring you success.", author:"Diego Val"
    },
    {
        text:"Happiness is the interval between periods of unhappiness.", author:"Don Marquis"
    },
    {
        text:"The world is full of people looking for spectacular happiness while they snub contentment.", author:"Doug Larson"
    },
    {
        text:"Happiness grows at our own firesides, and is not to be picked in strangers’ gardens.", author:"Douglas Jerrold"
    },
    {
        text:"Happiness is always the serendipitous result of looking for something else.", author:"Dr. Idel Dreimer"
    },
    {
        text:"The search for happiness is one of the chief sources of unhappiness.", author:"Eric Hoffer"
    },
    {
        text:"Happiness lies in the joy of achievement and the thrill of creative effort.", author:"Frederick Keonig"
    },
    {
        text:"There can be no happiness if the things we believe in are different from the things we do.", author:"Freya Stark"
    },
    {
        text:"Happiness is having a large, loving, caring, close-knit family in another city.", author:"George Burns"
    },
    {
        text:"Happiness is a by-product of an effort to make someone else happy.", author:"Gretta Brooker Palmer"
    },
    {
        text:"Cheerfulness is what greases the axles of the world. Don’t go through life creaking.", author:"H.W. Byles"
    },
    {
        text:"All happiness depends on courage and work.", author:"Honoré de Balzac"
    },
    {
        text:"Now and then it’s good to pause in our pursuit of happiness and just be happy.", author:"Guillaume Apollinaire"
    },
    {
        text:"Happiness is distraction from the human tragedy.", author:"J.M. Reinoso"
    },
    {
        text:"Real happiness is cheap enough, yet how dearly we pay for its counterfeit.", author:"Hosea Ballou"
    },
    {
        text:"The foolish man seeks happiness in the distance, the wise grows it under his feet.", author:"James Oppenheim"
    },
    {
        text:"I must learn to be content with being happier than I deserve.", author:"Jane Austen, Pride and Prejudice"
    },
    {
        text:"Ask yourself whether you are happy and you cease to be so.", author:"John Stuart Mill"
    },
    {
        text:"You cannot protect yourself from sadness without protecting yourself from happiness.", author:"Jonathan Safran Foer"
    },
    {
        text:"You can’t be happy unless you’re unhappy sometimes.", author:"Lauren Oliver"
    },
    {
        text:"He who lives in harmony with himself lives in harmony with the universe.", author:"Marcus Aurelius"
    },
    {
        text:"The happiness of your life depends upon the quality of your thoughts.", author:"Marcus Aurelius"
    },
    {
        text:"Happiness is not a state to arrive at, but a manner of traveling.", author:"Margaret Lee Runbeck"
    },
    {
        text:"Happiness is when what you think, what you say, and what you do are in harmony.", author:"Mahatma Gandhi"
    },
    {
        text:"Happiness is a well-balanced combination of love, labour, and luck.", author:"Mary Wilson Little"
    },
    {
        text:"Happiness is a dry martini and a good woman. Or a bad woman.", author:"George Burns"
    },
    {
        text:"Happiness is holding someone in your arms and knowing you hold the whole world.", author:"Orhan Pamuk"
    },
    {
        text:"Happiness is an accident of nature, a beautiful and flawless aberration.", author:"Pat Conroy"
    },
    {
        text:"It’s the moments that I stopped just to be, rather than do, that have given me true happiness.", author:"Sir Richard Branson"
    },
    {
        text:"Most people would rather be certain they’re miserable, than risk being happy.", author:"Robert Anthony"
    },
    {
        text:"Don’t waste your time in anger, regrets, worries, and grudges. Life is too short to be unhappy.", author:"Roy T. Bennett"
    },
    {
        text:"Love is that condition in which the happiness of another person is essential to your own.", author:"Robert A. Heinlein"
    },
    {
        text:"Happiness is a conscious choice, not an automatic response.", author:"Mildred Barthel"
    },
    {
        text:"Learn to value yourself, which means: fight for your happiness.", author:"Ayn Rand"
    },
    {
        text:"People should find happiness in the little things, like family.", author:"Amanda Bynes"
    },
    {
        text:"If only we’d stop trying to be happy we could have a pretty good time.", author:"Edith Wharton"
    },
    {
        text:"Happiness is the meaning and the purpose of life, the whole aim and end of human existence.", author:"Aristotle"
    },
    {
        text:"Happiness makes up in height for what it lacks in length.", author:"Robert Frost"
    },
    {
        text:"Happiness lies in the joy of achievement and the thrill of creative effort.", author:"Franklin D. Roosevelt"
    },
    {
        text:"If you are not happy here and now, you never will be.", author:"Taisen Deshimaru"
    },
    {
        text:"We all live with the objective of being happy; our lives are all different and yet the same.", author:"Anne Frank"
    },
    {
        text:"I have only two kinds of days: happy and hysterically happy.", author:"Allen J. Lefferdink"
    },
    {
        text:"Be happy with what you have. Be excited about what you want.", author:"Alan Cohen"
    },
    {
        text:"The best way to cheer yourself up is to try to cheer somebody else up.", author:"Mark Twain"
    },
    {
        text:"A truly happy person is one who can enjoy the scenery while on a detour.", author:"Unknown"
    },
    {
        text:"We are no longer happy so soon as we wish to be happier.", author:"Walter Savage Landor"
    }
]

// ======================
// STATE VARIABLES
// ======================

let canvas;
let canvasWidth;
let canvasHeight;
const scaleWidth = 1.0;
const scaleHeight = 0.92;

let watch = null;
let scene = null;
let sceneStartSec = -1;
let sceneFrame = 0;

const SCENE_DURATION = 10; // seconds
const FRAME_RATE = 20;

export const simpleClock = (p5) => {
    p5.setup = () => {
        // Reset global variables
        canvas = null;
        watch = null;
        scene = null;
        sceneStartSec = -1;
        sceneFrame = 0;

        canvasHeight = p5.round(window.innerHeight * scaleHeight);
        canvasWidth = p5.round(window.innerWidth * scaleWidth);

        canvas = p5.createCanvas(canvasWidth, canvasHeight);
        p5.frameRate(FRAME_RATE);
    };

    p5.draw = () => {
        p5.background(100);

        const radius = Math.min(canvasWidth, canvasHeight) * 0.45;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        // Initialize watch if needed
        if (!watch) {
            watch = new Watch(centerX, centerY, radius);
        }
        watch.draw(p5);

        // Create new scene every SCENE_DURATION seconds
        if (sceneStartSec === -1 ||
            ((p5.second() - sceneStartSec) % SCENE_DURATION === 0 && sceneStartSec !== p5.second())) {
            scene = new Scene(centerX, centerY, radius);
            sceneStartSec = p5.second();
            sceneFrame = 0;
        }

        if (scene) {
            scene.draw(p5, sceneFrame);
            sceneFrame++;
        }
    };

    p5.windowResized = () => {
        canvasWidth = p5.windowWidth * scaleWidth;
        canvasHeight = p5.windowHeight * scaleHeight;
        watch = null;
        scene = null;
        canvas = canvas ? p5.resizeCanvas(canvasWidth, canvasHeight) : p5.createCanvas(canvasWidth, canvasHeight);
    };
};

// ======================
// SCENE CLASS
// ======================

class Scene {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.quote = quotes[getRandomInt(0, quotes.length - 1)];

        // Pastel color palette
        const pastelColors = [
            { r: 255, g: 200, b: 220 }, // Pink
            { r: 200, g: 220, b: 255 }, // Light blue
            { r: 220, g: 255, b: 200 }, // Light green
            { r: 255, g: 230, b: 200 }, // Peach
            { r: 230, g: 200, b: 255 }, // Lavender
            { r: 255, g: 250, b: 200 }, // Light yellow
        ];
        this.faceColor = pastelColors[getRandomInt(0, pastelColors.length - 1)];

        // Face expression type
        this.faceType = getRandomInt(0, 4); // 0: happy, 1: surprised, 2: wink, 3: hearts, 4: sleepy

        // Random animation offset
        this.animOffset = Math.random() * Math.PI * 2;
    }

    draw(p5, frame) {
        p5.push();
        p5.translate(this.x, this.y);

        // Animation progress (0 to 1)
        const totalFrames = FRAME_RATE * SCENE_DURATION;
        const progress = frame / totalFrames;
        const sinProgress = Math.sin(progress * Math.PI); // Smooth ease in/out

        // Draw decorative shapes
        this.drawDecorations(p5, sinProgress);

        // Draw quote text
        this.drawQuoteText(p5, sinProgress);

        p5.pop();
    }

    drawDecorations(p5, sinProgress) {
        // Subtle floating animation
        const floatOffset = Math.sin((p5.millis() / 2000) + this.animOffset) * 15;

        p5.push();
        p5.translate(0, floatOffset);

        // Draw cute face in background
        this.drawCuteFace(p5, sinProgress);

        p5.pop();
    }

    drawCuteFace(p5, sinProgress) {
        const faceSize = this.radius * 1.2 * sinProgress;
        const alpha = 150 * sinProgress; // Subtle opacity

        // Face background circle
        p5.noStroke();
        p5.fill(this.faceColor.r, this.faceColor.g, this.faceColor.b, alpha);
        p5.ellipse(0, -50, faceSize, faceSize);

        // Eyes and mouth with darker pastel color
        const featureAlpha = 180 * sinProgress;
        p5.fill(
            this.faceColor.r * 0.6,
            this.faceColor.g * 0.6,
            this.faceColor.b * 0.6,
            featureAlpha
        );

        const eyeSize = faceSize * 0.12;
        const eyeOffset = faceSize * 0.15;
        const eyeY = -50 - faceSize * 0.1;

        // Draw eyes based on face type
        switch (this.faceType) {
            case 0: // Happy eyes
                p5.ellipse(-eyeOffset, eyeY, eyeSize, eyeSize);
                p5.ellipse(eyeOffset, eyeY, eyeSize, eyeSize);
                break;
            case 1: // Surprised (big round eyes)
                p5.ellipse(-eyeOffset, eyeY, eyeSize * 1.5, eyeSize * 1.5);
                p5.ellipse(eyeOffset, eyeY, eyeSize * 1.5, eyeSize * 1.5);
                break;
            case 2: // Wink (one closed)
                p5.ellipse(-eyeOffset, eyeY, eyeSize, eyeSize);
                p5.rect(eyeOffset - eyeSize / 2, eyeY - 2, eyeSize, 4, 2);
                break;
            case 3: // Hearts for eyes
                this.drawHeart(p5, -eyeOffset, eyeY, eyeSize * 0.8);
                this.drawHeart(p5, eyeOffset, eyeY, eyeSize * 0.8);
                break;
            case 4: // Sleepy (half closed)
                p5.arc(-eyeOffset, eyeY, eyeSize, eyeSize, 0, Math.PI);
                p5.arc(eyeOffset, eyeY, eyeSize, eyeSize, 0, Math.PI);
                break;
        }

        // Draw mouth
        const mouthY = -50 + faceSize * 0.2;
        const mouthWidth = faceSize * 0.25;

        p5.noFill();
        p5.stroke(
            this.faceColor.r * 0.6,
            this.faceColor.g * 0.6,
            this.faceColor.b * 0.6,
            featureAlpha
        );
        p5.strokeWeight(3);

        if (this.faceType === 1) {
            // Surprised mouth (O shape)
            p5.ellipse(0, mouthY, mouthWidth * 0.5, mouthWidth * 0.6);
        } else {
            // Smile
            p5.arc(0, mouthY, mouthWidth, mouthWidth * 0.6, 0, Math.PI);
        }

        // Blush cheeks
        p5.noStroke();
        p5.fill(255, 150, 150, alpha * 0.5);
        const cheekSize = faceSize * 0.15;
        const cheekOffset = faceSize * 0.28;
        p5.ellipse(-cheekOffset, -50 + faceSize * 0.05, cheekSize, cheekSize * 0.8);
        p5.ellipse(cheekOffset, -50 + faceSize * 0.05, cheekSize, cheekSize * 0.8);
    }

    drawHeart(p5, x, y, size) {
        p5.beginShape();
        const xOffset = x;
        const yOffset = y;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const r = size * (1 - Math.sin(angle));
            const hx = xOffset + r * Math.cos(angle);
            const hy = yOffset + r * Math.sin(angle) - size * 0.3;
            p5.vertex(hx, hy);
        }
        p5.endShape();
    }

    drawQuoteText(p5, sinProgress) {
        const quoteText = this.quote.text;
        const authorText = this.quote.author;

        // Calculate text size based on quote length
        const size = canvasWidth * 0.9;
        let quoteSize = size / quoteText.length * 2;
        let authorSize = quoteSize * 0.7;

        if (p5.windowWidth >= 768) {
            quoteSize = quoteSize * sinProgress + 1;
            authorSize = authorSize * sinProgress + 1;
        }

        p5.textFont('Georgia');

        // Elegant entrance animation
        const slideIn = Math.pow(sinProgress, 0.7); // Ease out
        const quoteY = -30 + (1 - slideIn) * -20; // Slide from top
        const authorY = 30 + (1 - slideIn) * 20; // Slide from bottom

        // Quote text with glow effect
        p5.push();

        // Soft glow
        p5.drawingContext.shadowBlur = 20;
        p5.drawingContext.shadowColor = `rgba(255, 255, 255, ${sinProgress * 0.3})`;

        // Shadow for depth
        p5.fill(0, 0, 0, 100 * sinProgress);
        p5.textSize(quoteSize);
        p5.text(quoteText, -p5.textWidth(quoteText) / 2 + 2, quoteY + 2);

        // Main quote text
        p5.fill(255, 255, 255, 255 * sinProgress);
        p5.text(quoteText, -p5.textWidth(quoteText) / 2, quoteY);

        p5.drawingContext.shadowBlur = 0;
        p5.pop();

        // Author text with different animation timing
        const authorDelay = Math.max(0, (sinProgress - 0.2) * 1.25); // Starts after quote

        p5.push();
        p5.textSize(authorSize);

        // Author shadow
        p5.fill(0, 0, 0, 80 * authorDelay);
        p5.text(authorText, -p5.textWidth(authorText) / 2 + 1, authorY + 1);

        // Author text with gold tint
        p5.fill(255, 240, 200, 220 * authorDelay);
        p5.text(authorText, -p5.textWidth(authorText) / 2, authorY);

        p5.pop();
    }
}

// ======================
// WATCH CLASS
// ======================

class Watch {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(p5) {
        p5.push();
        p5.translate(this.x, this.y);

        // Calculate angles for each hand
        const secondAngle = p5.map(p5.second(), 0, 60, 0, p5.TWO_PI) - p5.HALF_PI;
        const minuteAngle = p5.map(p5.minute() + p5.norm(p5.second(), 0, 60), 0, 60, 0, p5.TWO_PI) - p5.HALF_PI;
        const hourAngle = p5.map(p5.hour() + p5.norm(p5.minute(), 0, 60), 0, 24, 0, p5.TWO_PI * 2) - p5.HALF_PI;

        // Hand lengths
        const secondsRadius = this.radius;
        const minutesRadius = this.radius * 0.75;
        const hoursRadius = this.radius * 0.5;

        // Draw clock face
        this.drawClockFace(p5, this.radius);

        // Draw hour markers
        this.drawHourMarkers(p5, this.radius);

        // Draw clock hands (back to front)
        this.drawHourHand(p5, hourAngle, hoursRadius);
        this.drawMinuteHand(p5, minuteAngle, minutesRadius);
        this.drawSecondHand(p5, secondAngle, secondsRadius);

        // Center cap
        this.drawCenterCap(p5);

        p5.pop();
    }

    drawClockFace(p5, radius) {
        // Outer circle with gradient effect
        p5.noFill();
        p5.stroke(255, 255, 255, 30);
        p5.strokeWeight(2);
        p5.ellipse(0, 0, radius * 2, radius * 2);

        // Inner decorative circle
        p5.stroke(255, 255, 255, 15);
        p5.strokeWeight(1);
        p5.ellipse(0, 0, radius * 1.85, radius * 1.85);
    }

    drawHourMarkers(p5, radius) {
        for (let hour = 0; hour < 12; hour++) {
            const angle = (hour * 30 - 90) * (Math.PI / 180);
            const isMainHour = hour % 3 === 0;

            if (isMainHour) {
                // Large markers for 12, 3, 6, 9
                const x1 = Math.cos(angle) * (radius * 0.9);
                const y1 = Math.sin(angle) * (radius * 0.9);
                const x2 = Math.cos(angle) * (radius * 0.95);
                const y2 = Math.sin(angle) * (radius * 0.95);

                p5.stroke(255, 255, 255, 150);
                p5.strokeWeight(3);
                p5.line(x1, y1, x2, y2);
            } else {
                // Small dots for other hours
                const x = Math.cos(angle) * (radius * 0.92);
                const y = Math.sin(angle) * (radius * 0.92);

                p5.noStroke();
                p5.fill(255, 255, 255, 100);
                p5.ellipse(x, y, 4, 4);
            }
        }
    }

    drawHourHand(p5, angle, length) {
        p5.push();
        p5.rotate(angle);

        // Hand shadow
        p5.noStroke();
        p5.fill(0, 0, 0, 50);
        p5.beginShape();
        p5.vertex(0, -8);
        p5.vertex(length, 0);
        p5.vertex(0, 8);
        p5.vertex(-length * 0.2, 0);
        p5.endShape();

        // Main hand
        p5.fill(255, 255, 255, 200);
        p5.beginShape();
        p5.vertex(0, -6);
        p5.vertex(length, 0);
        p5.vertex(0, 6);
        p5.vertex(-length * 0.2, 0);
        p5.endShape();

        p5.pop();
    }

    drawMinuteHand(p5, angle, length) {
        p5.push();
        p5.rotate(angle);

        // Hand shadow
        p5.noStroke();
        p5.fill(0, 0, 0, 50);
        p5.beginShape();
        p5.vertex(0, -5);
        p5.vertex(length, 0);
        p5.vertex(0, 5);
        p5.vertex(-length * 0.15, 0);
        p5.endShape();

        // Main hand
        p5.fill(255, 255, 255, 230);
        p5.beginShape();
        p5.vertex(0, -4);
        p5.vertex(length, 0);
        p5.vertex(0, 4);
        p5.vertex(-length * 0.15, 0);
        p5.endShape();

        p5.pop();
    }

    drawSecondHand(p5, angle, length) {
        p5.push();
        p5.rotate(angle);

        // Thin elegant second hand
        p5.stroke(255, 100, 100, 200);
        p5.strokeWeight(2);
        p5.line(-length * 0.15, 0, length * 0.95, 0);

        // Decorative circle at the end
        p5.noStroke();
        p5.fill(255, 100, 100, 180);
        p5.ellipse(length * 0.95, 0, 8, 8);

        p5.pop();
    }

    drawCenterCap(p5) {
        // Outer shadow circle
        p5.noStroke();
        p5.fill(0, 0, 0, 50);
        p5.ellipse(1, 1, 18, 18);

        // Main center cap
        p5.fill(255, 255, 255, 220);
        p5.ellipse(0, 0, 16, 16);

        // Inner highlight
        p5.fill(255, 255, 255, 150);
        p5.ellipse(-2, -2, 8, 8);
    }
}
