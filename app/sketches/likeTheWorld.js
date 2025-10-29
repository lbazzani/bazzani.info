// ======================
// UTILITY FUNCTIONS
// ======================

function mapRange(n, start1, stop1, start2, stop2, withinBounds) {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2);
    } else {
        return constrain(newval, stop2, start2);
    }
}

function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
}

function projectOnSphere(x, y, radius) {
    // x goes from 0 to mapWidth, representing longitude 0 to 2*PI
    // y goes from 0 to mapHeight, representing latitude -PI/2 to PI/2
    const longitude = (x / mapWidth) * Math.PI * 2;
    const latitude = ((y / mapHeight) - 0.5) * Math.PI;

    // 3D sphere projection
    const projectedX = radius * Math.cos(latitude) * Math.sin(longitude);
    const projectedY = radius * Math.sin(latitude);
    const projectedZ = radius * Math.cos(latitude) * Math.cos(longitude);

    return { x: projectedX, y: projectedY, z: projectedZ };
}

// ======================
// STATE VARIABLES
// ======================

let canvas;
let canvasWidth;
let canvasHeight;
const scaleWidth = 1.0;
const scaleHeight = 0.92;

const FRAME_RATE = 30; // Increased for smoother animation

let radius;
let centerX;
let centerY;
let mapWidth;
let mapHeight;
let rotation = 0;

let coastlineShapes = null;

// Interactive controls state
let rotationSpeed = 2;
let isRotating = true;
let rotationDirection = 1; // 1 or -1
let zoomLevel = 1.0;
let showHeart = true;
let showStars = true;

// Colors
let landColor = { r: 100, g: 180, b: 120 };
let oceanColor = { r: 15, g: 25, b: 45 };

// UI state
let controlsVisible = true;
let controlsPanel = null;

// ======================
// DATA FETCHING
// ======================

const generateMockCoastlineData = () => {
    // Generate simple mock data: circles representing continents
    const shapes = [];
    const numContinents = 6;

    for (let i = 0; i < numContinents; i++) {
        const continent = [];
        const centerX = Math.random() * mapWidth;
        const centerY = (Math.random() * 0.6 + 0.2) * mapHeight; // Keep in middle band
        const radiusX = mapWidth * 0.1 + Math.random() * mapWidth * 0.1;
        const radiusY = mapHeight * 0.1 + Math.random() * mapHeight * 0.1;
        const segments = 40;

        for (let j = 0; j < segments; j++) {
            const angle1 = (j / segments) * Math.PI * 2;
            const angle2 = ((j + 1) / segments) * Math.PI * 2;
            const x1 = centerX + Math.cos(angle1) * radiusX;
            const y1 = centerY + Math.sin(angle1) * radiusY;
            const x2 = centerX + Math.cos(angle2) * radiusX;
            const y2 = centerY + Math.sin(angle2) * radiusY;

            continent.push([
                (x1 % mapWidth + mapWidth) % mapWidth,
                Math.max(0, Math.min(mapHeight, y1)),
                (x2 % mapWidth + mapWidth) % mapWidth,
                Math.max(0, Math.min(mapHeight, y2))
            ]);
        }
        shapes.push(continent);
    }

    return shapes;
}

const fetchCoastlineData = async () => {
    const url = `/api/coastline?cnvWidth=${mapWidth}&cnvHeight=${mapHeight}`;
    console.log("Fetching coastline data from:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        coastlineShapes = await response.json();
        console.log("Coastline data loaded:", coastlineShapes.length, "shapes");
    } catch (error) {
        console.warn("Error fetching coastline data, using mock data:", error);
        // Fallback to mock data
        coastlineShapes = generateMockCoastlineData();
        console.log("Generated mock coastline data:", coastlineShapes.length, "shapes");
    }
}

// ======================
// INITIALIZATION
// ======================

const init = async (p5) => {
    // Calculate canvas dimensions
    canvasHeight = p5.round(window.innerHeight * scaleHeight);
    canvasWidth = p5.round(window.innerWidth * scaleWidth);

    // Calculate sphere dimensions
    radius = Math.min(canvasWidth, canvasHeight) * 0.9 / 2;
    mapWidth = radius * 4;
    mapHeight = mapWidth / 2;
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;
    rotation = 0;

    // Fetch coastline data
    await fetchCoastlineData();
}

// ======================
// DRAWING HELPERS
// ======================

function drawCoastlines(p5, isFront) {
    if (!coastlineShapes) return;

    // Draw each shape - only lines, no fill
    for (let s = 0; s < coastlineShapes.length; s++) {
        const coordinates = coastlineShapes[s];

        for (let c = 0; c < coordinates.length; c++) {
            const coord = coordinates[c];
            let x1 = coord[0];
            const y1 = coord[1];
            let x2 = coord[2];
            const y2 = coord[3];

            // Apply rotation
            x1 = (x1 - rotation + mapWidth) % mapWidth;
            x2 = (x2 - rotation + mapWidth) % mapWidth;

            // Project both points
            const proj1 = projectOnSphere(x1, y1, radius);
            const proj2 = projectOnSphere(x2, y2, radius);

            const isFront1 = proj1.z > 0;
            const isFront2 = proj2.z > 0;

            // Draw line only if both points are on the correct hemisphere
            if (isFront === isFront1 && isFront === isFront2) {
                // Calculate depth-based shading
                let avgZ = (proj1.z + proj2.z) / 2;
                let depthFactor = Math.max(0, Math.min(1, Math.abs(avgZ) / radius));
                let brightness = isFront ? 1.0 : 0.5 + (0.5 * depthFactor);
                let alpha = isFront ? 255 : Math.max(100, 220 * depthFactor);

                p5.strokeWeight(isFront ? 1.0 : 0.6);
                p5.stroke(
                    landColor.r * brightness * 0.7,
                    landColor.g * brightness * 0.9,
                    landColor.b * brightness * 0.8,
                    alpha
                );
                p5.line(proj1.x, proj1.y, proj2.x, proj2.y);
            }
        }
    }
}

// ======================
// MAIN SKETCH
// ======================

export const likeTheWorld = (p5) => {
    p5.setup = async () => {
        await init(p5);
        canvas = p5.createCanvas(canvasWidth, canvasHeight);
        p5.frameRate(FRAME_RATE);
        createControls(p5);
    };

    p5.draw = () => {
        if (!coastlineShapes) {
            // Loading screen
            p5.background(0);
            p5.fill(255, 200);
            p5.noStroke();
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(20);
            p5.text('Loading Earth...', canvasWidth / 2, canvasHeight / 2);
            return;
        }

        // Update rotation based on controls
        if (isRotating) {
            rotation = rotation + (rotationSpeed * rotationDirection);
            if (rotation > mapWidth) {
                rotation = 0;
            }
            if (rotation < 0) {
                rotation = mapWidth;
            }
        }

        // Dark space background
        p5.background(5, 5, 15);

        // Draw stars if enabled
        if (showStars) {
            p5.noStroke();
            for (let i = 0; i < 100; i++) {
                const starX = (i * 137.5) % canvasWidth;
                const starY = (i * 197.3) % canvasHeight;
                const starSize = ((i * 73) % 3) + 1;
                const starAlpha = 100 + ((i * 43) % 155);
                p5.fill(255, 255, 255, starAlpha);
                p5.ellipse(starX, starY, starSize, starSize);
            }
        }

        // Draw sphere
        p5.push();
        p5.translate(centerX, centerY);
        p5.scale(zoomLevel);

        // Outer glow
        for (let i = 3; i > 0; i--) {
            p5.fill(100, 150, 255, 15 * i);
            p5.noStroke();
            p5.ellipse(0, 0, (radius * 2) + (i * 10), (radius * 2) + (i * 10));
        }

        // Base sphere (ocean) - always semi-transparent to see through
        p5.fill(oceanColor.r, oceanColor.g, oceanColor.b, 180);
        p5.noStroke();
        p5.ellipse(0, 0, radius * 2, radius * 2);

        // Apply circular clipping mask
        p5.drawingContext.save();
        p5.drawingContext.beginPath();
        p5.drawingContext.arc(0, 0, radius, 0, Math.PI * 2);
        p5.drawingContext.clip();

        // Draw back hemisphere first (with transparency)
        drawCoastlines(p5, false);

        // Heart at the center - pulsing (drawn BETWEEN back and front hemispheres)
        if (showHeart) {
            const time = p5.frameCount * 0.02;
            const pulse = Math.sin(time) * 0.15 + 1; // Subtle pulse between 0.85 and 1.15
            const heartSize = radius * 0.3 * pulse;

            p5.fill(255, 140, 160, 255); // Pastel pink/coral
            p5.noStroke();

            p5.push();
            p5.translate(0, heartSize * 0.1);

            // Draw classic heart shape with just 3 elements: 2 circles + 1 rotated square
            const s = heartSize / 16;

            // Left circle (top-left lobe)
            p5.ellipse(-s * 3, -s * 3, s * 8, s * 8);

            // Right circle (top-right lobe)
            p5.ellipse(s * 3, -s * 3, s * 8, s * 8);

            // Rotated square for the bottom part
            p5.push();
            p5.rotate(p5.PI / 4); // 45 degrees
            p5.rect(-s * 4.2, -s * 4.2, s * 8.4, s * 8.4);
            p5.pop();

            p5.pop();
        }

        // Draw front hemisphere on top (covers the heart partially)
        drawCoastlines(p5, true);

        p5.drawingContext.restore();

        p5.pop();

        // Enhanced signature with styling
        p5.noStroke();
        p5.textAlign(p5.LEFT, p5.BOTTOM);

        // Shadow effect
        p5.fill(0, 0, 0, 100);
        p5.textSize(13);
        p5.text("@bazzani - gen 22", canvasWidth - 126, canvasHeight - 9);

        // Main text
        p5.fill(150, 200, 255, 200);
        p5.textSize(13);
        p5.text("@bazzani - gen 22", canvasWidth - 127, canvasHeight - 10);
    };

    p5.windowResized = () => {
        canvasHeight = p5.windowHeight * scaleHeight;
        canvasWidth = p5.windowWidth * scaleWidth;
        canvas = canvas ? p5.resizeCanvas(canvasWidth, canvasHeight) : p5.createCanvas(canvasWidth, canvasHeight);
    };
};

// ======================
// UI CONTROLS
// ======================

function createControls(p5) {
    // Create control panel
    const panel = document.createElement('div');
    panel.id = 'earthControls';
    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: ${controlsVisible ? '20px' : '-320px'};
        width: 300px;
        background: rgba(10, 15, 35, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(155, 89, 182, 0.3);
        z-index: 1000;
        font-family: Arial, sans-serif;
        color: white;
        transition: right 0.3s ease;
    `;

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 18px; color: #9B59B6;">🌍 Earth Controls</h3>
            <button id="toggleControls" style="
                background: rgba(155, 89, 182, 0.2);
                border: 1px solid rgba(155, 89, 182, 0.4);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
            ">Collapse</button>
        </div>

        <div id="controlsContent">
            <!-- Rotation Section -->
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(155, 89, 182, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: #aaa;">⟳ Rotation</span>
                    <button id="playPause" style="
                        background: rgba(100, 180, 120, 0.3);
                        border: 1px solid rgba(100, 180, 120, 0.5);
                        color: white;
                        padding: 4px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                    ">⏸ Pause</button>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                    <button id="reverseBtn" style="
                        flex: 1;
                        background: rgba(155, 89, 182, 0.2);
                        border: 1px solid rgba(155, 89, 182, 0.4);
                        color: white;
                        padding: 8px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                    ">← Reverse</button>
                    <button id="forwardBtn" style="
                        flex: 1;
                        background: rgba(155, 89, 182, 0.2);
                        border: 1px solid rgba(155, 89, 182, 0.4);
                        color: white;
                        padding: 8px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Forward →</button>
                </div>
                <div>
                    <label style="font-size: 12px; color: #aaa;">Speed: <span id="speedValue">2</span>x</label>
                    <input type="range" id="speedSlider" min="0" max="5" step="0.5" value="2" style="
                        width: 100%;
                        margin-top: 5px;
                    ">
                </div>
            </div>

            <!-- Zoom Section -->
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(155, 89, 182, 0.2);">
                <label style="font-size: 14px; color: #aaa;">🔍 Zoom: <span id="zoomValue">1.0</span>x</label>
                <input type="range" id="zoomSlider" min="0.5" max="2" step="0.1" value="1" style="
                    width: 100%;
                    margin-top: 8px;
                ">
            </div>

            <!-- Visual Options -->
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(155, 89, 182, 0.2);">
                <div style="font-size: 14px; color: #aaa; margin-bottom: 10px;">🎨 Visual Options</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                        <input type="checkbox" id="showHeartCheck" checked style="cursor: pointer;">
                        ❤️ Show Heart
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                        <input type="checkbox" id="showStarsCheck" checked style="cursor: pointer;">
                        ⭐ Show Stars
                    </label>
                </div>
            </div>

            <!-- Colors -->
            <div>
                <div style="font-size: 14px; color: #aaa; margin-bottom: 10px;">🎨 Colors</div>
                <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <label style="font-size: 12px; color: #aaa; display: block; margin-bottom: 4px;">Land</label>
                        <input type="color" id="landColorPicker" value="#64b478" style="
                            width: 100%;
                            height: 32px;
                            border-radius: 6px;
                            cursor: pointer;
                            border: 1px solid rgba(155, 89, 182, 0.4);
                        ">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 12px; color: #aaa; display: block; margin-bottom: 4px;">Ocean</label>
                        <input type="color" id="oceanColorPicker" value="#0f192d" style="
                            width: 100%;
                            height: 32px;
                            border-radius: 6px;
                            cursor: pointer;
                            border: 1px solid rgba(155, 89, 182, 0.4);
                        ">
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);
    controlsPanel = panel;

    // Toggle button (visible when collapsed) - with pulsing animation
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'showControls';
    toggleBtn.innerHTML = '⚙️';
    toggleBtn.style.cssText = `
        position: fixed;
        top: 80px;
        right: ${controlsVisible ? '-60px' : '20px'};
        width: 48px;
        height: 48px;
        background: rgba(155, 89, 182, 0.95);
        border: 2px solid rgba(155, 89, 182, 0.6);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 1001;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(155, 89, 182, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
    `;

    // Add pulsing animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(155, 89, 182, 0.6); }
            50% { transform: scale(1.05); box-shadow: 0 4px 30px rgba(155, 89, 182, 0.9); }
        }
    `;
    document.head.appendChild(style);
    toggleBtn.onmouseover = () => {
        toggleBtn.style.transform = 'scale(1.1) rotate(90deg)';
    };
    toggleBtn.onmouseout = () => {
        toggleBtn.style.transform = 'scale(1) rotate(0deg)';
    };
    document.body.appendChild(toggleBtn);

    // Event listeners
    document.getElementById('toggleControls').onclick = () => {
        controlsVisible = false;
        panel.style.right = '-320px';
        toggleBtn.style.right = '20px';
    };

    toggleBtn.onclick = () => {
        controlsVisible = true;
        panel.style.right = '20px';
        toggleBtn.style.right = '-60px';
        toggleBtn.style.animation = 'none';
    };

    document.getElementById('playPause').onclick = function() {
        isRotating = !isRotating;
        this.innerHTML = isRotating ? '⏸ Pause' : '▶ Play';
        this.style.background = isRotating ? 'rgba(100, 180, 120, 0.3)' : 'rgba(220, 100, 100, 0.3)';
        this.style.borderColor = isRotating ? 'rgba(100, 180, 120, 0.5)' : 'rgba(220, 100, 100, 0.5)';
    };

    document.getElementById('reverseBtn').onclick = () => {
        rotationDirection = -1;
    };

    document.getElementById('forwardBtn').onclick = () => {
        rotationDirection = 1;
    };

    document.getElementById('speedSlider').oninput = function() {
        rotationSpeed = parseFloat(this.value);
        document.getElementById('speedValue').textContent = rotationSpeed.toFixed(1);
    };

    document.getElementById('zoomSlider').oninput = function() {
        zoomLevel = parseFloat(this.value);
        document.getElementById('zoomValue').textContent = zoomLevel.toFixed(1);
    };

    document.getElementById('showHeartCheck').onchange = function() {
        showHeart = this.checked;
    };

    document.getElementById('showStarsCheck').onchange = function() {
        showStars = this.checked;
    };

    document.getElementById('landColorPicker').oninput = function() {
        const hex = this.value;
        landColor = {
            r: parseInt(hex.substr(1, 2), 16),
            g: parseInt(hex.substr(3, 2), 16),
            b: parseInt(hex.substr(5, 2), 16)
        };
    };

    document.getElementById('oceanColorPicker').oninput = function() {
        const hex = this.value;
        oceanColor = {
            r: parseInt(hex.substr(1, 2), 16),
            g: parseInt(hex.substr(3, 2), 16),
            b: parseInt(hex.substr(5, 2), 16)
        };
    };
}
