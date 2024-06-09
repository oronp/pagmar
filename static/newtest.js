startGetEmotions()

let emotionData
let data


scribbleForce = 5
scribbleSpeed = .05
radius = 200

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

let cameraZ = 800
let targetCameraZ = 800
function keyPressed(){
    if (key == ' '){
        if (targetCameraZ == 800) targetCameraZ = 0
        else targetCameraZ = 800
    }
}

function draw() {
    background(220);
    if (cameraZ != targetCameraZ) cameraZ = lerp(cameraZ, targetCameraZ, 0.1)
    translate(0,0,cameraZ)
    rotateY(map(cameraZ, 0, 800, 0, 180))

    if (emotionData) {
        Object.keys(emotionData).forEach((key, i) => {
            data[key] = lerp(data[key], emotionData[key], 0.01)
        })

        let targetPoint = calculateTargetPoint();
        rotateTowardsTarget(targetPoint);

        putTexts()
        // drawSphere()


        // get the new point
        newPos = calculateFixedPoint(0, 0, radius)
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



function putTexts() {
    fill(0)
    push()
    translate(radius, 0, 0)
    rotateY(90)
    text('Fear', 0, 0)
    pop()

    push()
    translate(-radius, 0, 0)
    rotateY(-90)
    text('Hope', 0, 0)
    pop()

    push()
    translate(0, radius, 0)
    rotateX(-90)
    text('Happy', 0, 0)
    pop()

    push()
    translate(0, -radius, 0)
    rotateX(90)
    text('Sad', 0, 0)
    pop()

    push()
    translate(0, 0, radius)
    text('Disapponted', 0, 0)
    pop()

    push()
    translate(0, 0, -radius)
    rotateY(180)
    text('Surprise', 0, 0)
    pop()
    noFill()
}

function drawSphere() {
    push()
    stroke(0, 50)
    strokeWeight(1)
    circle(0, 0, radius*2)
    rotateY(90)
    circle(0, 0, radius*2)
    rotateX(90)
    circle(0, 0, radius*2)
    pop()
}





let points
function calculateTargetPoint() {
    if (!points){
        points = [createVector(1, 0, 0),  // hope
            createVector(-1, 0, 0), // fear
            createVector(0, 1, 0),  // sad
            createVector(0, -1, 0), // happy
            createVector(0, 0, 1),  // disappointed
            createVector(0, 0, -1)  // surprised
          ];
    }

    // Calculate weighted average of the emotion points
    let target = createVector(0, 0, 0);
    target.add(p5.Vector.mult(points[0], data.hope));
    target.add(p5.Vector.mult(points[1], data.fear));
    target.add(p5.Vector.mult(points[2], data.sad));
    target.add(p5.Vector.mult(points[3], data.happy));
    target.add(p5.Vector.mult(points[4], data.disappointment));
    target.add(p5.Vector.mult(points[5], data.surprise));
    
    // Normalize the target point to keep it on the sphere
    target.normalize();
    return target;
  }
  
  function rotateTowardsTarget(target) {
    // Calculate the rotation needed to move towards the target point
    let currentPoint = createVector(0, 0, 1); // Assume initial point at (0,0,1)
    let axis = p5.Vector.cross(currentPoint, target);
    let angle = acos(p5.Vector.dot(currentPoint, target));
    
    rotX = angle * axis.x;
    rotY = angle * axis.y;
    rotZ = angle * axis.z;
    rotateX(rotX);
    rotateY(rotY);
    rotateZ(rotZ);
  }
  
  function drawEmotionPoints() {
    // Draw the points representing emotions on the sphere
    stroke(255, 0, 0);
    strokeWeight(10);
    for (let point of points) {
      point(point.x * 200, point.y * 200, point.z * 200);
    }
  }