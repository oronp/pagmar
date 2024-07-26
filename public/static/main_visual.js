let emotionData, data, sound_1, sound_2, sound_3;
var name;
let ballRadius = 200;
let r = 200;
let holeR = 0;
let extraRotation = 0;
let scribbleForce = 4;
let scribbleSpeed = 0.3;
let cameraChangeSpeed = 0.01;
let ballRotationSpeed = 0.005;
let holes = [];
let coords = [];
let lastUpdateTime = 0; // Initialize lastUpdateTime
let expansionRate = 0.005; // Initialize the expansion rate
let cameraZ = 800;
let targetCameraZ = 800;
let continuousRotX = 0; // Add continuous rotation variables
let continuousRotY = 0;
let continuousRotZ = 0;

// emotions are: sad, disgust, angry, happy, surprise, neutral, fear
onNewEmotionData = (newData) => {
    if (newData.status) {
        let e = newData.emotion;
        e.hope = (e.happy + e.happy + e.surprise + e.neutral) / 4;
        e.disappointment = (e.sad + e.disgust + e.angry + e.fear) / 4;
        delete e.disgust;
        delete e.neutral;
        delete e.angry;
        const magnitude = Object.values(e).reduce((acc, val) => acc + val, 0);
        if (magnitude) Object.keys(e).forEach(key => e[key] /= magnitude);
        emotionData = e;
        if (!data) data = e;
    } else emotionData = null;
};

function preload() {
    const urlParams = new URLSearchParams(window.location.search);
    sound_to_play = urlParams.get('sound_to_play');

    myFont = loadFont('static/font.ttf');

    image01 = loadImage('static/Net1.png');
    image02 = loadImage('static/Net2.png');
    image03 = loadImage('static/Net3.png');
    image04 = loadImage('static/Net4.png');
    image05 = loadImage('static/003-rivers21.png');
    image06 = loadImage('static/004-shake map2.png');
    image07 = loadImage('static/herzFront.png');
    image08 = loadImage('static/herzBack.png');
    image09 = loadImage('static/backrounds grain.png');

    sound_1 = loadSound(`${sound_to_play}_00.mp3`);
    sound_2 = loadSound(`${sound_to_play}_01.mp3`);
    sound_3 = loadSound(`${sound_to_play}_02.mp3`);
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noFill();
    angleMode(DEGREES);
    imageMode(CENTER);
    textFont(myFont);
    textSize(12);
    textAlign(CENTER, CENTER);

    let user_answer;

    // Play sound_1 at the beginning
    sound_1.play();

    const sound_duration = sound_1.duration();
    setTimeout(async () => {
        try {
            user_answer = await getUserAnswer();
        } catch (error) {
            user_answer = false;
        }
    }, (sound_duration - 10) * 1000);

    // Play sound_2 or sound_3 when sound_1 ends
    sound_1.onended(async () => {
        try {
            if (user_answer) {
                console.log('user said: yes');
                sound_2.play();
            } else {
                console.log('user said: no');
                sound_3.play();
            }
            targetCameraZ = 100;
        } catch (error) {
            console.error('Speech recognition error:', error);
            sound_3.play();
        }
    });
    sound_3.onended(() => {
        fetch('https://oronp2912.pythonanywhere.com/stop_running')
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
    sound_2.onended(() => {
        fetch('https://oronp2912.pythonanywhere.com/stop_running')
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
}

function draw() {
    background(220);

    continuousRotX += 0.01; // Adjust these values for different rotation speeds
    continuousRotY += 0.01;
    continuousRotZ += 0.01;

    if (cameraZ != targetCameraZ) cameraZ = lerp(cameraZ, targetCameraZ, cameraChangeSpeed);
    translate(0, 0, cameraZ);

    /// ----------------
    // ----- LAYER 00 -----
    push();
    translate(0, 0, -2000);
    texture(image09);
    noStroke();
    plane(7669, 4314);
    resetShader();
    pop();

    /// ----------------
    // ----- LAYER 1 -----
    push();
    translate(0, 0, -305);
    noStroke();
    plane(1920, 1080);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 2 -----
    push();
    translate(0, 0, -300);
    texture(image01);
    noStroke();
    rotateZ(frameCount * 0.028);
    plane(7680 / 2.5, 5956 / 2.5);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 3 -----
    push();
    translate(0, 0, -250);
    texture(image02);
    noStroke();
    rotateZ(frameCount * 0.04);
    plane(7680 / 4, 5956 / 4);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 4 -----
    push();
    translate(0, 0, -250);
    texture(image03);
    noStroke();
    rotateZ(frameCount * 0.038);
    plane(7680 / 5, 5956 / 5);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 5 -----
    push();
    translate(0, 0, -250);
    texture(image04);
    noStroke();
    rotateZ(frameCount * 0.03);
    plane(7680 / 5.5, 5956 / 5.5);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 6 -----
    push();
    translate(0, 0, -250);
    texture(image05);
    noStroke();
    rotateZ(-frameCount * 0.02);
    plane(7680 / 5.5, 5956 / 5.5);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 7 -----
    push();
    translate(0, 0, -250);
    texture(image06);
    noStroke();
    rotateZ(-frameCount * 0.015);
    plane(7680 / 5.5, 5956 / 5.5);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 8 -----
    push();
    translate(0, 0, -210);
    texture(image07);
    noStroke();
    plane(7669 / 3.5, 4314 / 3.5);
    resetShader();
    pop();

    // -----------------
    // ------- LAYER 9 -----
    push();
    translate(0, 0, -210);
    texture(image08);
    noStroke();
    plane(7669 / 3.5, 4314 / 3.5);
    resetShader();
    pop();

    // Display the "Hertz" in the space
    push();
    translate(-200, -120, 200); // Center of the canvas
    textFont(myFont); // Set the custom font
    textSize(5); // Adjust the size if needed
    fill(100, 100, 100);
    text("+\n365-HZ", 0, 0);
    pop();

    push();
    translate(50, 50, 500); // Center of the canvas
    textFont(myFont); // Set the custom font
    textSize(2); // Adjust the size if needed
    fill(100, 100, 100);
    text("+\n826-HZ", 0, 0);
    pop();

    push();
    translate(-70, -70, 550); // Center of the canvas
    textFont(myFont); // Set the custom font
    textSize(2); // Adjust the size if needed
    fill(100, 100, 100);
    text("+\n728-HZ", 0, 0);
    pop();

    push();
    translate(-100, 100, 350); // Center of the canvas
    textFont(myFont); // Set the custom font
    textSize(3); // Adjust the size if needed
    fill(100, 100, 100);
    text("+\n990-HZ", 0, 0);
    pop();

    push();
    translate(300, 150, 150); // Center of the canvas
    textFont(myFont); // Set the custom font
    textSize(6); // Adjust the size if needed
    fill(100, 100, 100);
    text("+\n421-HZ", 0, 0);
    pop();

    push();
    translate(180, 0, 250); // Center of the canvas
    textFont(myFont); // Set the custom font
    textSize(4); // Adjust the size if needed
    fill(100, 100, 100);
    text("+\n633-HZ", 0, 0);
    pop();

    rotateY(map(cameraZ, 0, 800, 0, 180));

    if (emotionData) {
        holeR = 0;
        Object.keys(emotionData).forEach((key, i) => {
            data[key] = lerp(data[key], emotionData[key], ballRotationSpeed);
        });
        expansionRate = 0.7; // Reset expansion rate when emotion data is present
    } else {
        holeR += 1;
        expansionRate += 0.01; // Gradually increase the expansion rate
    }

    if (!data) return;

    let targetPoint = calculateTargetPoint();
    rotateTowardsTarget(targetPoint);
    rotateY(extraRotation);

    putTexts();
    // drawSphere()

    // get the new point
    newPos = calculateFixedPoint(0, 0, r);
    if (emotionData) coords.push({pos: newPos, size: noise(frameCount / 5) * 3 + 0.5});
    else if (frameCount % 5 == 0) {
        // if not found a face - rotate slightly using rotationAmout
        let rotationAmount = expansionRate / 2;
        const angleX = random(-rotationAmount, rotationAmount);
        const angleY = random(-rotationAmount, rotationAmount);
        const angleZ = random(-rotationAmount, rotationAmount);

        newPos = rotateVector(newPos, angleX, angleY, angleZ);
        // this is the new random 'hole' point and its size
        coords.push({pos: newPos, size: noise(frameCount / 30) * 28});
    }

    // draw the points
    stroke(0);
    const stepSize = targetCameraZ == 800 ? 1 : 1;
    for (let i = 0; i < coords.length - 1; i++) {
        const coord1 = coords[i];
        const coord2 = coords[i + 1];
        const d = coord1.pos.dist(coord2.pos);
        for (let j = 0; j < d; j += stepSize) {
            const pos = p5.Vector.lerp(coord1.pos, coord2.pos, j / d);
            const dotSize = lerp(coord1.size, coord2.size, j / d);
            strokeWeight(dotSize);
            point(pos.x, pos.y, pos.z);
        }
    }
    stroke(0, 50);
    holes.forEach(hole => {
        strokeWeight(hole.size);
        point(hole.pos.x, hole.pos.y, hole.pos.z);
    });
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

function keyPressed() {
    if (key == ' ') {
        if (targetCameraZ == 800) targetCameraZ = 100;
        else targetCameraZ = 800;
    }
    if (key == 'p') {
        video1.play();
    }
}

function putTexts() {
    fill(0);
    push();
    translate(ballRadius, 0, 0);
    rotateY(-90);
    text('Fear', 0, 0);
    pop();

    push();
    translate(-ballRadius, 0, 0);
    rotateY(90);
    text('Hope', 0, 0);
    pop();

    push();
    translate(0, ballRadius, 0);
    rotateX(90);
    rotateZ(180);
    text('Happy', 0, 0);
    pop();

    push();
    translate(0, -ballRadius, 0);
    rotateX(-90);
    rotateZ(180);
    text('Sad', 0, 0);
    pop();

    push();
    translate(0, 0, ballRadius);
    rotateY(180);
    text('Disappointed', 0, 0);
    pop();

    push();
    translate(0, 0, -ballRadius);
    rotateY(0);
    text('Surprise', 0, 0);
    pop();
    noFill();
}

function drawSphere() {
    push();
    stroke(0, 50);
    strokeWeight(1);
    circle(0, 0, ballRadius * 2);
    rotateY(90);
    circle(0, 0, ballRadius * 2);
    rotateX(90);
    circle(0, 0, ballRadius * 2);
    pop();
}

// Function to rotate a vector
function rotateVector(v, angleX, angleY, angleZ) {
    let result = createVector(v.x, v.y, v.z);

    // Rotate around X-axis
    result = createVector(
        result.x,
        result.y * cos(angleX) - result.z * sin(angleX),
        result.y * sin(angleX) + result.z * cos(angleX)
    );

    // Rotate around Y-axis
    result = createVector(
        result.x * cos(angleY) + result.z * sin(angleY),
        result.y,
        -result.x * sin(angleY) + result.z * cos(angleY)
    );

    // Rotate around Z-axis
    result = createVector(
        result.x * cos(angleZ) - result.y * sin(angleZ),
        result.x * sin(angleZ) + result.y * cos(angleZ),
        result.z
    );

    return result;
}
