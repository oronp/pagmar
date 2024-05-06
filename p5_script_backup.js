let emotions = { status: false };
let points = [];

let directionEase = 0.1;
let speedEase = 0.05;

function preload() {
    bgImage = loadImage("files/BackgroundP5.png");
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

setInterval(fetchEmotions, 250); // Update 4 times a second

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Set the background to white
    background(255);

    // Load the background image
    bgImage = loadImage("files/BackgroundP5.png", () => {
        // Calculate the center of the window
        let centerX = windowWidth / 2;
        let centerY = windowHeight / 2;

        // Draw the background image at the center of the canvas
        imageMode(CENTER);
        image(bgImage, centerX, centerY);

        // Initialize other variables
        angleMode(DEGREES);
        points.push([centerX, centerY]);
        position = createVector(centerX, centerY);
        direction = createVector(0, 1);
        splashSize = 0;
    });
}

function draw() {
    if (!emotions.status) {
        no_face_detection();
    } else {
        dots_locations = emotions.axis_dots;
        newTest(dots_locations);
        splashSize = 0;
    }
}

function newTest(current_dots) {
    current_dots = [current_dots[0] + width / 2, current_dots[1] + height / 2];
    if (points.slice(-1)[0][0] !== current_dots[0] && points.slice(-1)[0][1] !== current_dots[1]) {
        points.push(current_dots);
    }

    let nextTarget = createVector(current_dots[0], current_dots[1]);
    let lengthToTarget = position.dist(nextTarget);
    let dirToTarget = p5.Vector.sub(nextTarget, position).normalize();
    direction = p5.Vector.lerp(direction, dirToTarget, directionEase);
    direction.rotate(random(-50, 50));

    let moving = p5.Vector.mult(direction, lengthToTarget * speedEase);
    let nextPosition = p5.Vector.add(position, moving);

    stroke(0);
    erase();
    point(position.x, position.y);
    noErase();

    stroke(0);
    strokeWeight(noise(frameCount / 30) * 2);

    let startLine = p5.Vector.add(position, p5.Vector.mult(direction, noise(frameCount / 30) * 2));

    line(position.x, position.y, nextPosition.x, nextPosition.y);

    position = nextPosition;
}

function no_face_detection() {
    fill(0, 10);
    noStroke();
    splashSize = splashSize + 0.1;

    translate(position.x, position.y);
    let blobDir;

    beginShape();
    for (let angle = 0; angle < 360; angle += 20) {
        blobDir = createVector(1, 0).rotate(angle);
        blobDir.mult(splashSize);
        blobDir.mult(noise(angle / 100, frameCount / 30) * 2);

        if (angle == 0) curveVertex(blobDir.x, blobDir.y);
        curveVertex(blobDir.x, blobDir.y);
    }
    curveVertex(blobDir.x, blobDir.y);
    endShape(CLOSE);
    resetMatrix();
}
