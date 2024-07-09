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
        fill(0, 10)
        noStroke()
        holeCircles.push({
            x: pos.x, y: pos.y, z: z,
            angleX: random(360), angleY: random(360), angleZ: random(360),
            size: holeSize
        })
        holeSize += 1
    } else {
        // Movement logic (similar to the original drawPoints function)
        const dirToTarget = p5.Vector.sub(target, pos).normalize();
        dir = p5.Vector.lerp(dir, dirToTarget, directionEase);
        dir.rotate(random(-10, 10));

        const distToTarget = target.dist(pos);
        const moveSize = distToTarget * speedEase;

        pos.add(p5.Vector.mult(dir, moveSize));
        z = noise(frameCount / 30) * 100;

        // Store current position for drawing
        points.push({ x: pos.x, y: pos.y, z: z });
    }

    // Draw lines between consecutive points
    stroke(0);
    for (let i = 0; i < points.length - 1; i++) {
        line(points[i].x, points[i].y, points[i].z, points[i + 1].x, points[i + 1].y, points[i + 1].z);
    }
    noStroke()
    fill(0, 60)

    holeCircles.forEach(c => {
        push()
        translate(c.x, c.y, c.z)
        rotateX(c.angleX)
        rotateY(c.angleY)
        rotateZ(c.angleZ)
        circle(0, 0, c.size)
        pop()
    })
}