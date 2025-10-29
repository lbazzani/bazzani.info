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

function getRandomColor() {
  // Desaturated base colors - will brighten with energy
  const colors = [
    { r: 180, g: 100, b: 100 }, // Muted Red
    { r: 100, g: 150, b: 145 },  // Muted Turquoise
    { r: 180, g: 170, b: 100 },  // Muted Yellow
    { r: 130, g: 100, b: 140 },  // Muted Purple
    { r: 90, g: 130, b: 160 },   // Muted Blue
    { r: 100, g: 150, b: 110 },  // Muted Green
  ];
  return colors[getRandomInt(0, colors.length - 1)];
}

// ======================
// STATE VARIABLES
// ======================

let canvas;
let canvasWidth;
let canvasHeight;
const scaleWidth = 1.0;
const scaleHeight = 0.92; // Reduced to account for app bar

// Game rules constants
const MAX_BALL_POWER = 10;
const INITIAL_MAX_BALLS = 50;
const MIN_BALLS = 3;
const MAX_BALLS = 100;
const ENERGY_TRANSFER_RATE = 0.1; // How much energy is transferred per collision
const KILL_SIZE_RATIO = 2.5; // If ball is 2.5x bigger, it can eat smaller one

let balls = [];
let numBalls = 0;
let totalPower = 0;
let ballRadius = 20;
let velocityCorrection = 0;
let resetTimer = 1000;
let showInstructions = true;
let resetButtonHovered = false;
let showRules = true;

// ======================
// MAIN SKETCH
// ======================

export const powerGame = (p5) => {
  p5.setup = () => {
    initializeGame(p5);
  };

  p5.draw = () => {
    renderGame(p5);
  };

  p5.mousePressed = () => handleClick(p5);
  p5.touchStarted = () => handleClick(p5);
  p5.mouseMoved = () => handleMouseMove(p5);
  p5.windowResized = () => handleResize(p5);
};

// ======================
// GAME LOGIC
// ======================

function initializeGame(p5) {
  // Reset state
  canvas = null;
  balls = [];
  numBalls = 0;
  totalPower = 0;
  resetTimer = 1000;
  velocityCorrection = 0;
  showInstructions = true;

  // Setup canvas
  canvasHeight = p5.round(window.innerHeight * scaleHeight);
  canvasWidth = p5.round(window.innerWidth * scaleWidth);
  canvas = p5.createCanvas(canvasWidth, canvasHeight);

  // Initialize balls
  resetBalls(p5);
}

function resetBalls(p5) {
  numBalls = getRandomInt(MIN_BALLS, INITIAL_MAX_BALLS);
  ballRadius = Math.max(
    parseInt(Math.min(canvasHeight, canvasWidth) / Math.sqrt(numBalls) / 4),
    8
  );

  balls = [];
  for (let i = 0; i < numBalls; i++) {
    addBall(
      p5,
      getRandomInt(ballRadius, canvasWidth - ballRadius),
      getRandomInt(ballRadius, canvasHeight - ballRadius)
    );
  }
}

function addBall(p5, x, y) {
  const color = getRandomColor();
  const velocity = {
    x: getRandomInt(-4, 4),
    y: getRandomInt(-4, 4)
  };

  balls.push(new Ball(x, y, velocity.x, velocity.y, ballRadius, color, balls.length + 1));
}

function handleClick(p5) {
  // Check if clicking reset button
  if (isClickingResetButton(p5.mouseX, p5.mouseY)) {
    resetBalls(p5);
    showInstructions = true;
    return false;
  }

  if (p5.mouseY > 0 && p5.mouseY < canvasHeight && p5.mouseX > 0 && p5.mouseX < canvasWidth) {
    // Check if clicking on a ball
    let clickedBall = null;
    for (let ball of balls) {
      if (!ball.exploded && !ball.isExploding) {
        const distance = Math.sqrt((p5.mouseX - ball.x) ** 2 + (p5.mouseY - ball.y) ** 2);
        if (distance < ball.radius) {
          clickedBall = ball;
          break;
        }
      }
    }

    if (clickedBall) {
      // Kill the ball with animation
      clickedBall.killBall();
      numBalls--;
    } else if (numBalls < MAX_BALLS) {
      // Add new ball in empty space
      addBall(p5, p5.mouseX, p5.mouseY);
      numBalls++;
      showInstructions = false;
    }
    return false;
  }
}

function handleMouseMove(p5) {
  resetButtonHovered = isClickingResetButton(p5.mouseX, p5.mouseY);
}

function isClickingResetButton(mouseX, mouseY) {
  const padding = 16;
  const btnWidth = 120;
  const btnHeight = 40;
  const btnX = canvasWidth - btnWidth - padding;
  const btnY = padding;

  return mouseX >= btnX && mouseX <= btnX + btnWidth &&
         mouseY >= btnY && mouseY <= btnY + btnHeight;
}

function handleResize(p5) {
  canvasWidth = p5.windowWidth * scaleWidth;
  canvasHeight = p5.windowHeight * scaleHeight;
  canvas = canvas ? p5.resizeCanvas(canvasWidth, canvasHeight) : p5.createCanvas(canvasWidth, canvasHeight);
}

// ======================
// RENDERING
// ======================

function renderGame(p5) {
  // Check game state
  if (numBalls === 0 || balls.length === 0) {
    resetBalls(p5);
  }

  if (numBalls === 1) {
    if (resetTimer === 0) {
      resetTimer = 1000;
      resetBalls(p5);
    }
    resetTimer--;
  }

  // Background with subtle gradient effect
  p5.background(10, 10, 15);

  // Hide default cursor
  p5.noCursor();

  // Update and render balls
  let sumTotalPower = 0;
  let leaderPower = 0;
  let leaderIndex = 0;

  try {
    for (let i = 0; i < balls.length; i++) {
      if (!balls[i].exploded) {
        balls[i].update(p5);
        balls[i].checkCollisions(balls);

        const ballPower = Math.abs(balls[i].vx) + Math.abs(balls[i].vy);
        if (!balls[i].isExploding) {
          sumTotalPower += ballPower;
          if (ballPower > leaderPower) {
            leaderPower = ballPower;
            leaderIndex = i;
          }
        }
        balls[i].isLeader = false;
      }
    }

    if (balls[leaderIndex]) {
      balls[leaderIndex].isLeader = true;
    }
    totalPower = sumTotalPower;
  } catch (error) {
    console.warn('Error in ball update:', error);
  }

  // Update velocity correction
  velocityCorrection = (numBalls * MAX_BALL_POWER) / Math.max(totalPower, 1) * (1 + 1 / numBalls);

  // Render all balls
  for (let i = 0; i < balls.length; i++) {
    if (!balls[i].exploded) {
      balls[i].render(p5);
    }
  }

  // Render UI
  renderUI(p5);

  // Render custom cursor
  renderCursor(p5);
}

function renderUI(p5) {
  p5.push();

  if (numBalls === 1) {
    // Winner announcement
    p5.fill(255, 255, 255, 200);
    p5.textSize(48);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textStyle(p5.BOLD);
    p5.text('WINNER!', canvasWidth / 2, canvasHeight / 2 - 40);

    p5.textSize(24);
    p5.textStyle(p5.NORMAL);
    p5.text(`Reset in ${Math.floor(resetTimer / 60)}s`, canvasWidth / 2, canvasHeight / 2 + 20);
  } else {
    // Stats panel - top left
    renderStatsPanel(p5);

    // Instructions - bottom center
    if (showInstructions || numBalls < 15) {
      renderInstructions(p5);
    }

    // Rules panel - bottom left
    if (showRules) {
      renderRulesPanel(p5);
    }
  }

  p5.pop();
}

function renderStatsPanel(p5) {
  const padding = 16;
  const panelWidth = 200;
  const panelHeight = 100;

  // Semi-transparent background
  p5.fill(0, 0, 0, 180);
  p5.noStroke();
  p5.rect(padding, padding, panelWidth, panelHeight, 8);

  // Border
  p5.stroke(155, 89, 182, 100);
  p5.strokeWeight(2);
  p5.noFill();
  p5.rect(padding, padding, panelWidth, panelHeight, 8);

  // Text
  p5.noStroke();
  p5.fill(255, 255, 255, 230);
  p5.textSize(14);
  p5.textAlign(p5.LEFT, p5.TOP);
  p5.textStyle(p5.NORMAL);

  const textX = padding + 12;
  let textY = padding + 12;

  p5.fill(155, 89, 182);
  p5.textStyle(p5.BOLD);
  p5.text('STATS', textX, textY);

  textY += 24;
  p5.fill(255, 255, 255, 230);
  p5.textStyle(p5.NORMAL);

  // Ball count with color based on cap
  const ballPercent = numBalls / MAX_BALLS;
  if (ballPercent > 0.8) {
    p5.fill(255, 107, 107); // Red when near max
  } else {
    p5.fill(255, 255, 255, 230);
  }
  p5.text(`Balls: ${numBalls}/${MAX_BALLS}`, textX, textY);

  textY += 20;
  p5.fill(255, 255, 255, 230);
  const powerPercent = parseInt((totalPower / (numBalls * MAX_BALL_POWER)) * 100);
  p5.text(`Power: ${powerPercent}%`, textX, textY);

  textY += 20;
  p5.text(`Energy: ${(velocityCorrection * 100).toFixed(0)}%`, textX, textY);

  // Reset button (top right)
  renderResetButton(p5);
}

function renderResetButton(p5) {
  const padding = 16;
  const btnWidth = 120;
  const btnHeight = 40;
  const btnX = canvasWidth - btnWidth - padding;
  const btnY = padding;

  // Button background
  if (resetButtonHovered) {
    p5.fill(78, 205, 196, 220);
  } else {
    p5.fill(0, 0, 0, 180);
  }
  p5.noStroke();
  p5.rect(btnX, btnY, btnWidth, btnHeight, 8);

  // Border
  p5.stroke(78, 205, 196, resetButtonHovered ? 200 : 100);
  p5.strokeWeight(2);
  p5.noFill();
  p5.rect(btnX, btnY, btnWidth, btnHeight, 8);

  // Text
  p5.noStroke();
  p5.fill(resetButtonHovered ? 10 : 78, resetButtonHovered ? 10 : 205, resetButtonHovered ? 15 : 196);
  if (resetButtonHovered) p5.fill(255, 255, 255);
  p5.textSize(16);
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.textStyle(p5.BOLD);
  p5.text('RESET', btnX + btnWidth / 2, btnY + btnHeight / 2);
}

function renderInstructions(p5) {
  const padding = 16;
  const panelHeight = 70;
  const panelWidth = 320;
  const x = (canvasWidth - panelWidth) / 2;
  const y = canvasHeight - panelHeight - padding;

  // Background
  p5.fill(0, 0, 0, 180);
  p5.noStroke();
  p5.rect(x, y, panelWidth, panelHeight, 8);

  // Border
  p5.stroke(78, 205, 196, 100);
  p5.strokeWeight(2);
  p5.noFill();
  p5.rect(x, y, panelWidth, panelHeight, 8);

  // Text
  p5.noStroke();
  p5.textAlign(p5.CENTER, p5.CENTER);
  p5.textStyle(p5.BOLD);

  p5.fill(78, 205, 196);
  p5.textSize(15);
  p5.text('Click empty space to add', canvasWidth / 2, y + panelHeight / 2 - 10);

  p5.fill(255, 107, 107);
  p5.textSize(15);
  p5.text('Click ball to destroy', canvasWidth / 2, y + panelHeight / 2 + 12);
}

function renderRulesPanel(p5) {
  const padding = 16;
  const panelWidth = 280;
  const panelHeight = 90;
  const x = padding;
  const y = canvasHeight - panelHeight - padding;

  // Background
  p5.fill(0, 0, 0, 150);
  p5.noStroke();
  p5.rect(x, y, panelWidth, panelHeight, 8);

  // Border
  p5.stroke(255, 215, 0, 80);
  p5.strokeWeight(1);
  p5.noFill();
  p5.rect(x, y, panelWidth, panelHeight, 8);

  // Title
  p5.noStroke();
  p5.fill(255, 215, 0, 200);
  p5.textSize(11);
  p5.textAlign(p5.LEFT, p5.TOP);
  p5.textStyle(p5.BOLD);
  p5.text('BATTLE ROYALE RULES', x + 10, y + 8);

  // Rules text
  p5.fill(255, 255, 255, 180);
  p5.textSize(10);
  p5.textStyle(p5.NORMAL);
  let textY = y + 25;

  p5.text('• Bigger balls absorb energy from smaller ones', x + 10, textY);
  textY += 14;
  p5.text('• If 2.5x bigger, the small ball gets eaten', x + 10, textY);
  textY += 14;
  p5.text('• Absorbing energy makes you grow stronger', x + 10, textY);
  textY += 14;
  p5.text('• Last ball standing wins!', x + 10, textY);
}

function renderCursor(p5) {
  // Check if mouse is over a ball
  let isOverBall = false;
  for (let ball of balls) {
    if (!ball.exploded && !ball.isExploding) {
      const distance = Math.sqrt((p5.mouseX - ball.x) ** 2 + (p5.mouseY - ball.y) ** 2);
      if (distance < ball.radius) {
        isOverBall = true;
        break;
      }
    }
  }

  p5.push();
  p5.translate(p5.mouseX, p5.mouseY);

  if (isOverBall) {
    // Destroy cursor (red crosshair)
    p5.stroke(255, 107, 107, 200);
    p5.strokeWeight(3);
    p5.noFill();

    // Pulsing circle
    const pulseSize = 20 + Math.sin(p5.frameCount * 0.15) * 3;
    p5.ellipse(0, 0, pulseSize * 2);

    // Crosshair
    const crossSize = 12;
    p5.line(-crossSize, 0, crossSize, 0);
    p5.line(0, -crossSize, 0, crossSize);

    // Corner brackets
    const bracketSize = 15;
    const bracketOffset = pulseSize;
    p5.strokeWeight(2);
    // Top-left
    p5.line(-bracketOffset, -bracketOffset, -bracketOffset + bracketSize, -bracketOffset);
    p5.line(-bracketOffset, -bracketOffset, -bracketOffset, -bracketOffset + bracketSize);
    // Top-right
    p5.line(bracketOffset, -bracketOffset, bracketOffset - bracketSize, -bracketOffset);
    p5.line(bracketOffset, -bracketOffset, bracketOffset, -bracketOffset + bracketSize);
    // Bottom-left
    p5.line(-bracketOffset, bracketOffset, -bracketOffset + bracketSize, bracketOffset);
    p5.line(-bracketOffset, bracketOffset, -bracketOffset, bracketOffset - bracketSize);
    // Bottom-right
    p5.line(bracketOffset, bracketOffset, bracketOffset - bracketSize, bracketOffset);
    p5.line(bracketOffset, bracketOffset, bracketOffset, bracketOffset - bracketSize);

  } else if (numBalls < MAX_BALLS) {
    // Add cursor (green plus sign)
    p5.stroke(78, 205, 196, 200);
    p5.strokeWeight(3);
    p5.noFill();

    // Circle
    p5.ellipse(0, 0, 30);

    // Plus sign
    const plusSize = 10;
    p5.strokeWeight(4);
    p5.line(-plusSize, 0, plusSize, 0);
    p5.line(0, -plusSize, 0, plusSize);

    // Outer glow circle
    p5.stroke(78, 205, 196, 50);
    p5.strokeWeight(1);
    p5.ellipse(0, 0, 40);
  } else {
    // Max balls reached - warning cursor
    p5.stroke(255, 217, 61, 200);
    p5.strokeWeight(3);
    p5.noFill();

    // Circle
    p5.ellipse(0, 0, 30);

    // Warning symbol (!)
    p5.fill(255, 217, 61, 200);
    p5.noStroke();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(20);
    p5.textStyle(p5.BOLD);
    p5.text('!', 0, 0);
  }

  p5.pop();
}

// ======================
// BALL CLASS
// ======================

class Ball {
  constructor(x, y, vx, vy, radius, color, id) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.baseColor = color; // Store base desaturated color
    this.color = color;
    this.id = id;
    this.collided = false;
    this.isExploding = false;
    this.exploded = false;
    this.isLeader = false;
    this.alpha = 255;
    this.deathExplosionRadius = 0;
    this.isManuallyKilled = false;
    this.energy = 0; // Energy level (0-1)
  }

  killBall() {
    this.isExploding = true;
    this.isManuallyKilled = true;
  }

  checkCollisions(allBalls) {
    // Reset collision state
    for (let ball of allBalls) {
      ball.collided = false;
    }

    // Check collisions with other balls
    for (let other of allBalls) {
      if (this.id === other.id || this.isExploding || other.isExploding) continue;

      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = other.radius + this.radius;

      if (distance < minDist) {
        this.collided = true;
        other.collided = true;

        // Determine who is bigger
        const sizeRatio = this.radius / other.radius;

        // BATTLE ROYALE MECHANICS (no size change, only energy)
        if (sizeRatio > KILL_SIZE_RATIO) {
          // This ball is much bigger - eat the smaller one!
          other.killBall();
          this.energy = Math.min(this.energy + 0.2, 1);
          numBalls--;
        } else if (sizeRatio < 1 / KILL_SIZE_RATIO) {
          // Other ball is much bigger - we get eaten!
          this.killBall();
          other.energy = Math.min(other.energy + 0.2, 1);
          numBalls--;
        } else if (sizeRatio > 1) {
          // This ball is bigger - absorb some energy
          this.energy = Math.min(this.energy + ENERGY_TRANSFER_RATE, 1);
          other.energy = Math.max(other.energy - ENERGY_TRANSFER_RATE * 0.5, 0);
        } else if (sizeRatio < 1) {
          // Other ball is bigger - we lose energy
          other.energy = Math.min(other.energy + ENERGY_TRANSFER_RATE, 1);
          this.energy = Math.max(this.energy - ENERGY_TRANSFER_RATE * 0.5, 0);
        }

        // Physical collision response
        const angle = Math.atan2(dy, dx);
        const targetX = this.x + Math.cos(angle) * minDist;
        const targetY = this.y + Math.sin(angle) * minDist;

        const ax = (targetX - other.x) * velocityCorrection;
        const ay = (targetY - other.y) * velocityCorrection;

        this.vx -= ax;
        this.vy -= ay;
        other.vx += ax;
        other.vy += ay;
      }
    }
  }

  update(p5) {
    // Update color based on energy level
    const energyBoost = this.energy * 0.6; // Max 60% brightness boost
    this.color = {
      r: Math.min(this.baseColor.r + this.baseColor.r * energyBoost, 255),
      g: Math.min(this.baseColor.g + this.baseColor.g * energyBoost, 255),
      b: Math.min(this.baseColor.b + this.baseColor.b * energyBoost, 255)
    };

    // Check for explosion
    if (!this.isExploding && Math.abs(this.vx) + Math.abs(this.vy) > MAX_BALL_POWER && this.collided) {
      this.isExploding = true;
      numBalls--;
    }

    // Handle explosion
    if (this.isExploding) {
      if (this.isManuallyKilled) {
        // Manual kill: expanding ring animation
        this.deathExplosionRadius += 3;
        this.alpha *= 0.88;
        this.vx *= 0.85;
        this.vy *= 0.85;

        if (this.alpha < 5 || this.deathExplosionRadius > this.radius * 8) {
          this.exploded = true;
        }
      } else {
        // Auto explosion: shrinking animation
        this.radius -= 0.15;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.alpha *= 0.92;

        if (Math.abs(this.vx) + Math.abs(this.vy) <= 0.2 || this.radius < 0.1) {
          this.exploded = true;
        }
      }
    }

    // Bounce off walls
    if (this.x >= p5.width - this.radius || this.x <= this.radius) {
      this.vx = -this.vx * velocityCorrection;
    }
    if (this.y >= p5.height - this.radius || this.y <= this.radius) {
      this.vy = -this.vy * velocityCorrection;
    }

    // Update position
    if (totalPower < numBalls * 100 && !this.isExploding) {
      this.x += this.vx;
      this.y += this.vy;

      // Keep within bounds
      this.x = Math.min(Math.max(this.x, this.radius), canvasWidth - this.radius);
      this.y = Math.min(Math.max(this.y, this.radius), canvasHeight - this.radius);
    } else if (totalPower >= numBalls * 100) {
      resetBalls(window.p5Instance);
    }
  }

  render(p5) {
    p5.push();

    // Death explosion animation
    if (this.isManuallyKilled && this.isExploding) {
      // Expanding rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = this.deathExplosionRadius - i * 15;
        if (ringRadius > 0) {
          p5.noFill();
          p5.stroke(this.color.r, this.color.g, this.color.b, this.alpha * (1 - i * 0.3));
          p5.strokeWeight(4 - i);
          p5.ellipse(this.x, this.y, ringRadius * 2, ringRadius * 2);
        }
      }

      // Center particles
      p5.drawingContext.shadowBlur = 20;
      p5.drawingContext.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha / 255})`;
      p5.noStroke();
      p5.fill(this.color.r, this.color.g, this.color.b, this.alpha);
      p5.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
    } else {
      // Clean 3D ball rendering
      p5.noStroke();

      // Dark shadow at bottom (subtle 3D effect)
      p5.fill(this.color.r * 0.5, this.color.g * 0.5, this.color.b * 0.5, this.alpha * 0.4);
      p5.ellipse(this.x + this.radius * 0.1, this.y + this.radius * 0.15, this.radius * 1.9, this.radius * 1.9);

      // Main ball body
      p5.fill(this.color.r, this.color.g, this.color.b, this.alpha);
      p5.ellipse(this.x, this.y, this.radius * 2, this.radius * 2);

      // Subtle highlight for 3D look
      if (!this.isExploding) {
        p5.fill(255, 255, 255, this.alpha * 0.35);
        p5.ellipse(this.x - this.radius * 0.25, this.y - this.radius * 0.25, this.radius * 0.5, this.radius * 0.5);
      }

      // Leader crown indicator
      if (this.isLeader && !this.isExploding) {
        p5.fill(255, 215, 0, this.alpha); // Gold color
        p5.noStroke();

        // Crown shape
        const crownSize = this.radius * 0.5;
        const crownY = this.y - this.radius - crownSize * 0.8;

        // Three peaks
        for (let i = 0; i < 3; i++) {
          const offsetX = (i - 1) * crownSize * 0.5;
          p5.triangle(
            this.x + offsetX - crownSize * 0.2, crownY,
            this.x + offsetX + crownSize * 0.2, crownY,
            this.x + offsetX, crownY - crownSize * 0.6
          );
        }

        // Crown base
        p5.rect(this.x - crownSize * 0.7, crownY, crownSize * 1.4, crownSize * 0.2, 2);

        // Jewel on crown
        p5.fill(255, 107, 107, this.alpha);
        p5.ellipse(this.x, crownY - crownSize * 0.3, crownSize * 0.2);
      }

      // Direction indicator - triangle on perimeter
      if (!this.isExploding) {
        const angle = Math.atan2(this.vy, this.vx);
        const triangleSize = this.radius * 0.4;

        p5.push();
        p5.translate(this.x, this.y);
        p5.rotate(angle);

        // Position triangle on outer edge of ball
        p5.translate(this.radius, 0);

        // Draw triangle with ball color
        p5.fill(this.color.r, this.color.g, this.color.b, this.alpha);
        p5.noStroke();
        p5.triangle(
          0, 0,
          -triangleSize, -triangleSize * 0.6,
          -triangleSize, triangleSize * 0.6
        );

        p5.pop();
      }
    }

    p5.pop();
  }
}
