// ----------------------------------------------------
// ----------------- boring Variables -----------------
// ----------------------------------------------------
let points = []; 
let target, pos, dir, z;
let creatingHole = false;
let holeCircles = []


// -------------------------------------------------------
// ----------------- important Constants -----------------
// -------------------------------------------------------
const direction_ease = 0.1
const speed_ease = 0.05
const hole_grow_speed = 0.1
const hole_depth_scale = 10

const top_camera_angle = 45
const camera_ease_time = 3
const camera_zoom_out = 1.5

// -----------------------------------------------------
// ----------------- Fetching Emotions -----------------
// -----------------------------------------------------
function fetchEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => {
            response.json()
                .then(data => {
                    if (data.status) {
                        creatingHole = false
                        const newTargetData = data.axis_dots;
                        target = createVector(newTargetData[0], newTargetData[1]);
                    } else {
                        if (!creatingHole) {
                            creatingHole = true
                            holeCircles.push({
                                x: pos.x, y: pos.y, z: pos.z,
                                size: 2,
                                holeModel: random(holes)
                            })
                        }
                    }
                })
                .catch(console.error);
        })
}
setInterval(fetchEmotions, 250); // Update 4 times a second


// ------------------------------------------------
// ----------------- holes ------------------------
// ------------------------------------------------
let holes = []
function preload(){
    for (let i=1;i<=6;i++){
        loadModel(`./static/Hole0${i}.stl`, hole => holes.push(hole))
    }
}

// ------------------------------------------------
// ----------------- Setup -----------------
// ------------------------------------------------
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    angleMode(DEGREES);

    frontCam = createCamera();
    frontCam.ortho()
    // frontCam.perspective(.2, 1, 0,1000000);
    // frontCam.setPosition(0,0,150000)

    topCam = createCamera();
    topCam.set(frontCam)
    topCam.tilt(top_camera_angle)
    const frontCamPos = createVector(frontCam.eyeY, frontCam.eyeZ).rotate(top_camera_angle)
    topCam.setPosition(0, frontCamPos.x * camera_zoom_out, frontCamPos.y * camera_zoom_out)
    
    setCamera(frontCam)

    pos = createVector(0, 0);
    dir = createVector(1, 0);
    target = createVector(0, 0); // Initialize target vector
    z = 0; // Initialize z-coordinate
}


// ----------------------------------------------------
// ----------------- Camera Switching -----------------
// ----------------------------------------------------
function keyPressed() {
    if (key === '1') {
        // hit 1 on the keyboard to switch top top camera
        // transition from front to top camera in 1 second
        showCamera(frontCam, topCam, camera_ease_time)
    } else if (key === '2') {
        // hit 2 on the keyboard to switch to front camera
        // transition from top to front camera in 2 seconds
        showCamera(topCam, frontCam, camera_ease_time)
    }
}

async function showCamera(cam1, cam2, secs) {
    const newCam = createCamera()
    newCam.set(cam1)
    setCamera(newCam)
    const startTime = performance.now()
    while (performance.now() - startTime < secs * 1000) {
        const t = (performance.now() - startTime) / (secs * 1000)
        newCam.slerp(cam1, cam2, easeInOutQuad(t))
        await new Promise(r => setTimeout(r, 0))
    }
    setCamera(cam2)
}

// ------------------------------------------------
// ----------------- Main Drawing -----------------
// ------------------------------------------------
function draw() {
    background(220);

    if (creatingHole) {
        const latestHole = holeCircles[holeCircles.length - 1]
        latestHole.size += hole_grow_speed
    } else {
        // Movement logic, incorporating direction noise and easing
        const dirToTarget = p5.Vector.sub(target, pos).normalize();
        dir = p5.Vector.lerp(dir, dirToTarget, direction_ease);
        dir.rotate(random(-50, 50)); // Add randomness to the direction

        const distToTarget = target.dist(pos);
        const moveSize = distToTarget * speed_ease;

        pos.add(p5.Vector.mult(dir, moveSize));
        z = noise(frameCount / 30) * 100; // Add noise-based variability to z

        // Store current position for drawing
        const thickness = noise(frameCount / 30) * 2;
        points.push({ x: pos.x, y: pos.y, z, thickness })
    }

    // Draw lines between consecutive points with varying stroke weight
    stroke(0);
    for (let i = 0; i < points.length - 1; i++) {
        strokeWeight(points[i].thickness);

        line(
            points[i].x, points[i].y, points[i].z,
            points[i + 1].x, points[i + 1].y, points[i + 1].z
        );
    }

    directionalLight(255, 255, 255, 0, 1, 1);

    strokeWeight(1)
    noStroke();
    holeCircles.forEach(c => {
        push();
        translate(c.x, c.y, c.z + c.size * 4 + 30)
        scale(c.size * 5.0)
        model(c.holeModel)
        pop();
    });
}

const easeInOutQuad = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;