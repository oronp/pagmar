startGetEmotions()

let emotionData
let data


ballRadius = 200
r = 200
holeR = 0
extraRotation = 0
scribbleForce = 4
scribbleSpeed = .1
cameraChangeSpeed = 0.01
ballRotationSpeed = 0.005
holes = []

// emotions are: sad, disgust, angry, happy, surprise, neutral, fear
onNewEmotionData = (newData) => {
    if (newData.status) {
        let e = newData.emotion
        e.hope = (e.happy + e.happy + e.surprise + e.neutral) / 4
        e.disappointment = (e.sad + e.disgust + e.angry + e.fear) / 4
        delete e.disgust
        delete e.neutral
        delete e.angry
        const magnitude = Object.values(e).reduce((acc, val) => acc + val, 0)
        if (magnitude) Object.keys(e).forEach(key => e[key] /= magnitude)
        emotionData = e
        if (!data) data = e
    }
    else emotionData = null
}


function preload() {
    myFont = loadFont('static/font.ttf');
    video1 = createVideo('static/01-particles.mp4')
    video1.hide()
    video1.loop()

    image01 = loadImage('static/Net01.png')
    image02 = loadImage('static/Net02.png')
    image03 = loadImage('static/Net03.png')
    image04 = loadImage('static/Net04.png')
}



let coords = []
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noFill()
    angleMode(DEGREES);
    imageMode(CENTER)
    textFont(myFont);
    textSize(12);
    textAlign(CENTER, CENTER);
}

function draw() {
    background(220);

    if (cameraZ != targetCameraZ) cameraZ = lerp(cameraZ, targetCameraZ, cameraChangeSpeed)
    translate(0,0,cameraZ)

    /// ----------------
    // ----- LAYER 1 -----
    push()
    translate(0,0,-2500)
    texture(video1)
    noStroke()
    plane(6500)
    resetShader()
    pop()

    // -----------------
    // ------- LAYER 2 -----
    push()
    translate(0,0,-205)
    texture(image01)
    noStroke()
    rotateZ(frameCount * 0.08)
    plane(3700, 2700)
    resetShader()
    pop()

     // -----------------
    // ------- LAYER 3 -----
    push()
    translate(0,0,-1000)
    texture(image02)
    noStroke()
    plane(4000, 3000)
    resetShader()
    pop()

     // -----------------
    // ------- LAYER 4 -----
    push()
    translate(0,0,-1000)
    texture(image03)
    noStroke()
    plane(4000, 3000)
    resetShader()
    pop()

     // -----------------
    // ------- LAYER 5 -----
    push()
    translate(0,0,-800)
    texture(image04)
    noStroke()
    plane(3000, 3000)
    resetShader()
    pop()


    rotateY(map(cameraZ, 0, 800, 0, 180))


    if (emotionData) {
        holeR = 0
        // r = ballRadius
        // extraRotation = lerp(extraRotation,0,.01)
        Object.keys(emotionData).forEach((key, i) => {
            data[key] = lerp(data[key], emotionData[key], ballRotationSpeed)
        })
    } else {
        holeR+=1
        // r = lerp(r,0,  0.01)
        // extraRotation+=0.1
    }

    if (!data) return

    let targetPoint = calculateTargetPoint();
    rotateTowardsTarget(targetPoint);
    rotateY(extraRotation)


    putTexts()
    // drawSphere()

    // get the new point
    newPos = calculateFixedPoint(0, 0, r)
    if (emotionData) coords.push({ pos: newPos, size: noise(frameCount / 10) * 3 + .5 })
    else if (frameCount % 5 == 0) {
        s = noise(frameCount / 20) * holeR
        // newPos.add(random(-s/2,s/2),random(-s/2,s/2), random(-s/2,s/2))
        holes.push({pos:newPos,size: s})
    }

    // draw the points
    stroke(0)
    const stepSize = targetCameraZ == 800 ? 1 : 1
    for (let i = 0; i < coords.length - 1; i++) {
        const coord1 = coords[i]
        const coord2 = coords[i + 1]
        const d = coord1.pos.dist(coord2.pos)
        for (let j = 0; j < d; j += stepSize) {
            const pos = p5.Vector.lerp(coord1.pos, coord2.pos, j / d)
            const dotSize = lerp(coord1.size, coord2.size, j / d)
            strokeWeight(dotSize)
            point(pos.x, pos.y, pos.z)
        }
    }

    // draw the holes
    stroke(0,50)
    holes.forEach(hole => {
        strokeWeight(hole.size)
        point(hole.pos.x,hole.pos.y,hole.pos.z)
    })
}

function calculateFixedPoint(x, y, z) {
    let point = createVector(x, y, z);
    point = inverseRotateX(point, -(rotX));
    point = inverseRotateY(point, -(rotY));
    point = inverseRotateZ(point, -(rotZ));
    return point;
}

function inverseRotateY(v, angle) {
    let cosA = cos(angle);
    let sinA = sin(angle);
    let x = cosA * v.x + sinA * v.z;
    let z = -sinA * v.x + cosA * v.z;
    return createVector(x, v.y, z);
}

function inverseRotateX(v, angle) {
    let cosA = cos(angle);
    let sinA = sin(angle);
    let y = cosA * v.y - sinA * v.z;
    let z = sinA * v.y + cosA * v.z;
    return createVector(v.x, y, z);
}

function inverseRotateZ(v, angle) {
    let cosA = cos(angle);
    let sinA = sin(angle);
    let x = cosA * v.x - sinA * v.y;
    let y = sinA * v.x + cosA * v.y;
    return createVector(x, y, v.z);
}


let cameraZ = 800
let targetCameraZ = 800
function keyPressed(){
    if (key == ' '){
        if (targetCameraZ == 800) targetCameraZ = 100
        else targetCameraZ = 800
    }
    if (key == 'p') {
        video1.play()
    }
}



function putTexts() {
    fill(0)
    push()
    translate(ballRadius, 0, 0)
    rotateY(-90)
    text('Fear', 0, 0)
    pop()

    push()
    translate(-ballRadius, 0, 0)
    rotateY(90)
    text('Hope', 0, 0)
    pop()

    push()
    translate(0, ballRadius, 0)
    rotateX(90)
    rotateZ(180)
    text('Happy', 0, 0)
    pop()

    push()
    translate(0, -ballRadius, 0)
    rotateX(-90)
    rotateZ(180)
    text('Sad', 0, 0)
    pop()

    push()
    translate(0, 0, ballRadius)
    rotateY(180)
    text('Disapponted', 0, 0)
    pop()

    push()
    translate(0, 0, -ballRadius)
    rotateY(0)
    text('Surprise', 0, 0)
    pop()
    noFill()
}

function drawSphere() {
    push()
    stroke(0, 50)
    strokeWeight(1)
    circle(0, 0, ballRadius*2)
    rotateY(90)
    circle(0, 0, ballRadius*2)
    rotateX(90)
    circle(0, 0, ballRadius*2)
    pop()
}