let points = []; // Declare points array in the global scope

let target, pos, dir, z; // Declare target, pos, dir, and z variables in the global scope

let creatingHole = false; // start with no hole
let holeCircles = []
let holeSize = 0

const directionEase = 0.1
const speedEase = 0.05


function fetchEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                creatingHole = false
                const newTargetData = data.axis_dots;
                target = createVector(newTargetData[0], newTargetData[1]);
            } else {
                if (!creatingHole) {
                    creatingHole = true
                    holeSize = 2
                }
            }
        })
        .catch(console.error);
}

setInterval(fetchEmotions, 250); // Update 4 times a second


function setup() {
    createCanvas(800, 800, WEBGL);
    angleMode(DEGREES);

    pos = createVector(0, 0);
    dir = createVector(1, 0);
    target = createVector(0, 0); // Initialize target vector
    z = 0; // Initialize z-coordinate
}



function draw() {
    background(220);
    orbitControl();

    if (creatingHole) {
        fill(0, 10);
        noStroke();
        holeCircles.push({
            x: pos.x, y: pos.y, z: z,
            angleX: random(360), angleY: random(360), angleZ: random(360),
            size: holeSize
        });
        holeSize += 1;
    } else {
        // Movement logic, incorporating direction noise and easing
        const dirToTarget = p5.Vector.sub(target, pos).normalize();
        dir = p5.Vector.lerp(dir, dirToTarget, directionEase);
        dir.rotate(random(-50, 50)); // Add randomness to the direction

        const distToTarget = target.dist(pos);
        const moveSize = distToTarget * speedEase;

        pos.add(p5.Vector.mult(dir, moveSize));
        z = noise(frameCount / 30) * 100; // Add noise-based variability to z

        // Store current position for drawing
        points.push({ x: pos.x, y: pos.y, z: z });
    }

    // Draw lines between consecutive points with varying stroke weight
    stroke(0);
    for (let i = 0; i < points.length - 1; i++) {
        let ovi_kav = noise(frameCount / 30 + i) * 2; // Use noise to vary the stroke weight
        strokeWeight(ovi_kav); // Set the stroke weight based on noise value

        // Drawing the line with noise implementation
        let startLine = p5.Vector.add(
            createVector(points[i].x, points[i].y, points[i].z),
            p5.Vector.mult(dir, ovi_kav)
        );

        line(
            points[i].x, points[i].y, points[i].z,
            points[i + 1].x, points[i + 1].y, points[i + 1].z
        );
    }

    noStroke();
    fill(0, 60);

    holeCircles.forEach(c => {
        push();
        translate(c.x, c.y, c.z);
        rotateX(c.angleX);
        rotateY(c.angleY);
        rotateZ(c.angleZ);
        circle(0, 0, c.size);
        pop();
    });
}