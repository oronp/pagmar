var screen_center = [0, 0];
let emotions = {status: false};
var points = [];
let position, direction;
let splashSize;

directionEase = 0.1;
speedEase = 0.05;

function preload() {
    bgImage = loadImage('files/background.png', img => {
        console.log("Image loaded successfully");
    }, err => {
        console.error("Failed to load image", err);
    });
}

function fetchEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => response.json())
        .then(data => {
            emotions = data;
            // Process and display emotions here
        })
        .catch(console.error);
}

setInterval(fetchEmotions, 250); // Update 4 times a second (every 250ms)

// Run one time in the beginning.
function setup() {
    let screen_ratio = [1080, 1080];
    createCanvas(screen_ratio[0], screen_ratio[1], WEBGL); // Use WEBGL renderer for 3D
    angleMode(DEGREES);

    screen_center = createVector(screen_ratio[0] / 2, screen_ratio[1] / 2);
    points.push(screen_center);

    // Maya! I deleted this line because you can't load 2D image to 3D canvas.
    // background(bgImage);

    position = createVector(0, 0); // Initialize position vector in 3D
    direction = createVector(1, 0); // Initialize direction vector in 3D
    z = 0

    splashSize = 0;
}

// Draw everything
function draw() {
    background(255); // Clear the background each frame
    orbitControl();

    // Move camera to a specific position if needed
    // camera(x, y, z, centerX, centerY, centerZ, upX, upY, upZ);

    if (!emotions.status) {
        no_face_detection();
    } else {
        dots_locations = emotions.axis_dots;
        draw_emotions(dots_locations);
        splashSize = 0;
    }
}

function draw_emotions(current_dots) {
    current_dots = createVector(current_dots[0] + screen_center.x, current_dots[1] + screen_center.y);

    if (points.slice(-1)[0].x !== current_dots.x && points.slice(-1)[0].y !== current_dots.y) {
        points.push(current_dots);
    }

    target = createVector(points[points.length - 1][0], points[points.length - 1][1])

    orbitControl();

    dirToTarget = p5.Vector.sub(target, position).normalize();
    direction = p5.Vector.lerp(direction, dirToTarget, 0.1);
    direction.rotate(random(-10, 10));

    distToTarget = target.dist(position);
    moveSize = distToTarget * .05

    nextPos = p5.Vector.add(position, p5.Vector.mult(direction, moveSize));
    nextZ = noise(frameCount / 30) * 100;

    points.push(createVector(position.x, position.y, z));
    position = nextPos;

    z = nextZ

    for (let i = 0; i < points.length - 1; i++) {
        line(points[i].x, points[i].y, points[i].z, points[i + 1].x, points[i + 1].y, points[i + 1].z);
    }
}

function no_face_detection() {
    fill(0, 10);
    noStroke();
    splashSize = splashSize + 0.1;

    translate(position.x, position.y, position.z); // Adjust for 3D
    beginShape();
    for (let angle = 0; angle < 360; angle += 20) {
        blobDir = createVector(1, 0).rotate(angle);
        blobDir.mult(splashSize);
        blobDir.mult(noise(angle / 100, frameCount / 30) * 2,);

        if (angle == 0) curveVertex(blobDir.x, blobDir.y, blobDir.z); // Adjust for 3D
        curveVertex(blobDir.x, blobDir.y, blobDir.z); // Adjust for 3D
    }
    curveVertex(blobDir.x, blobDir.y, blobDir.z); // Adjust for 3D
    endShape(CLOSE);
    resetMatrix();
}
