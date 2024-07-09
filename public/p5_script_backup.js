var screen_center = [0, 0];
let emotions = {status: false};
var points = [];
let angle = 0;

directionEase = 0.1
speedEase = 0.05

function preload(){
    bgImage = loadImage("files/BackgroundP5.png")
}

function fetchEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => response.json())
        .then(data => {
            emotions = data
            // Process and display emotions here
        })
        .catch(console.error);
}

setInterval(fetchEmotions, 250); // Update 4 times a second

function setup() {
    let screen_ratio = [1080, 1080]
    createCanvas(screen_ratio[0], screen_ratio[1], WEBGL); // Set up 3D canvas
    screen_center = [screen_ratio[0]/2, screen_ratio[1]/2]
    points.push(screen_center)
    background(bgImage);
    noFill();
}

// Draw everything
function draw() {
    translate(-width/2,-height/2); // Center the scene
    rotateY(angle); // Rotate around Y-axis for a 3D effect
    angle += 0.01; // Increment rotation angle

    if (!emotions.status){
        no_face_detection()
    }
    else {
        dots_locations = emotions.axis_dots
        // draw_line(dots_locations)
        newTest(dots_locations)
        splashSize = 0
    }
}

function newTest(current_dots){
    current_dots = [current_dots[0] + screen_center[0], current_dots[1] + screen_center[1]];
    if (points.slice(-1)[0][0] !== current_dots[0] && points.slice(-1)[0][1] !== current_dots[1]){
        points.push(current_dots);
    }

    nextTarget = points[points.length-1]
    nextTarget = createVector(nextTarget[0],nextTarget[1])

    lengthToTarget = position.dist(nextTarget)
    dirToTarget = p5.Vector.sub(nextTarget,position).normalize()
    direction = p5.Vector.lerp(direction, dirToTarget, directionEase)
    direction.rotate(random(-50,50))

    moving = p5.Vector.mult(direction, lengthToTarget * speedEase)
    nextPosition = p5.Vector.add(position, moving)

    stroke(0)
    erase()
    point(position.x,position.y)
    noErase()

    alpha = noise(frameCount / 30) * 255
    stroke(0)
    ovi_kav = noise(frameCount / 30) * 2
    strokeWeight(ovi_kav)

    startLine = p5.Vector.add(position,p5.Vector.mult(direction,ovi_kav))

    line(position.x,position.y,nextPosition.x,nextPosition.y)


    position = nextPosition
}

function draw_line(current_dots) {
    current_dots = [current_dots[0] + screen_center[0], current_dots[1] + screen_center[1]];
    if (points.slice(-1)[0][0] !== current_dots[0] && points.slice(-1)[0][1] !== current_dots[1]){
        points.push(current_dots);
        console.log(current_dots);
    }

    stroke(0);
    strokeWeight(1);
    strokeJoin(ROUND)

    beginShape();
    noFill();

    if (points.length > 1) {
        curveVertex(points[0][0], points[0][1]);  // Repeat the first point for control
    }

    for (let i = 0; i < points.length; i++) {
        curveVertex(points[i][0], points[i][1]);
    }

    if (points.length > 1) {
        curveVertex(points[points.length - 1][0], points[points.length - 1][1]);
    }

    endShape();
}

function no_face_detection(){
    fill(0,10)
    noStroke()
    splashSize = splashSize + 0.1

    translate(position.x,position.y)
    beginShape();
    for (let angle = 0; angle < 360; angle += 20) {
        blobDir = createVector(1,0).rotate(angle)
        blobDir.mult(splashSize)
        blobDir.mult(noise(angle / 100,frameCount / 30) * 2, )

        if (angle == 0) curveVertex(blobDir.x,blobDir.y)
        curveVertex(blobDir.x,blobDir.y)
    }
    curveVertex(blobDir.x,blobDir.y)
    endShape(CLOSE);
    resetMatrix()
}
