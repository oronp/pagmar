startGetEmotions()

let emotionData
let data


ballRadius = 200
scribbleForce = 4
scribbleSpeed = .1
cameraChangeSpeed = 0.01
ballRotationSpeed = 0.007

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
}

let coords = []
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noFill()
    angleMode(DEGREES);
    textFont(myFont);
    textSize(12);
    textAlign(CENTER, CENTER);
}

function draw() {
    background(220);
    if (cameraZ != targetCameraZ) cameraZ = lerp(cameraZ, targetCameraZ, cameraChangeSpeed)
    translate(0,0,cameraZ)
    rotateY(map(cameraZ, 0, 800, 0, 180))

    if (emotionData) {
        Object.keys(emotionData).forEach((key, i) => {
            data[key] = lerp(data[key], emotionData[key], ballRotationSpeed)
        })

        let targetPoint = calculateTargetPoint();
        rotateTowardsTarget(targetPoint);

        putTexts()
        // drawSphere()


        // get the new point
        newPos = calculateFixedPoint(0, 0, ballRadius)
        coords.push({ pos: newPos, size: noise(frameCount / 10) * 3 + 1 })

        // draw the points
        stroke(0)
        const stepSize = targetCameraZ == 800 ? .3 : 1
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
    }
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
        if (targetCameraZ == 800) targetCameraZ = 0
        else targetCameraZ = 800
    }
}



function putTexts() {
    fill(0)
    push()
    translate(ballRadius, 0, 0)
    rotateY(90)
    text('Fear', 0, 0)
    pop()

    push()
    translate(-ballRadius, 0, 0)
    rotateY(-90)
    text('Hope', 0, 0)
    pop()

    push()
    translate(0, ballRadius, 0)
    rotateX(-90)
    text('Happy', 0, 0)
    pop()

    push()
    translate(0, -ballRadius, 0)
    rotateX(90)
    text('Sad', 0, 0)
    pop()

    push()
    translate(0, 0, ballRadius)
    text('Disapponted', 0, 0)
    pop()

    push()
    translate(0, 0, -ballRadius)
    rotateY(180)
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