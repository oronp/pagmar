let points = []; // Declare points array in the global scope
let target, pos, dir, z; // Declare target, pos, dir, and z variables in the global scope

function fetchEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            emotions = data
            // Process and display emotions here
        })
        .catch(console.error);
}

setInterval(fetchPointsFromServer, 250); // Update 4 times a second

function setup() {
    createCanvas(400, 400, WEBGL);
    angleMode(DEGREES);
    pos = createVector(0, 0);
    dir = createVector(1, 0);
    target = createVector(0, 0); // Initialize target vector
    z = 0; // Initialize z-coordinate
}

function draw() {
    background(220);
    orbitControl();

    // Check if points array is defined and not empty
    console.log(points)
    if (points && points.length > 0) {
        let currentPoint = points.shift(); // Get the next point from the array
        target = createVector(currentPoint.x, currentPoint.y);
    }

    // Movement logic (similar to the original drawPoints function)
    let dirToTarget = p5.Vector.sub(target, pos).normalize();
    dir = p5.Vector.lerp(dir, dirToTarget, 0.1);
    dir.rotate(random(-10, 10));

    let distToTarget = target.dist(pos);
    let moveSize = distToTarget * 0.05;

    let nextPos = p5.Vector.add(pos, p5.Vector.mult(dir, moveSize));
    let nextZ = noise(frameCount / 30) * 100;

    // Store current position for drawing
    points.push({x: pos.x, y: pos.y, z: z});

    // Update position and z-coordinate
    pos = nextPos;
    z = nextZ;

    // Draw lines between consecutive points
    for (let i = 0; i < points.length - 1; i++) {
        line(points[i].x, points[i].y, points[i].z, points[i + 1].x, points[i + 1].y, points[i + 1].z);
    }
}
