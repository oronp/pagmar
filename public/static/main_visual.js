let emotionData, data, randomIndex, myFont;
let sounds = []
let images = []
let ballRadius = 200;
let r = 200;
let holeR = 0;
let extraRotation = 0;
let scribbleForce = 7;
let scribbleSpeed = 0.05;
let cameraChangeSpeed = 0.01;
let ballRotationSpeed = 0.005;
let holes = [];
let coords = [];
let lastUpdateTime = 0; // Initialize lastUpdateTime
let expansionRate = 0.005; // Initialize the expansion rate
let cameraZ = 800;
let targetCameraZ = 800;

// emotions are: sad, disgust, angry, happy, surprise, neutral, fear
onNewEmotionData = (newData) => {
    if (newData.status) {
        let e = newData.emotion;
        e.hope = (e.happy + e.happy + e.neutral) / 4 + (Math.random() * 0.4) - 0.15;
        e.disappointment = (e.sad + e.disgust + e.angry + e.fear) / 4 + (Math.random() * 0.4) - 0.15;
        e.surprise += e.neutral + (Math.random() * 0.4) - 0.15;
        e.happy += (Math.random() * 0.4) - 0.15;
        e.fear += (Math.random() * 0.4) - 0.15;
        e.sad += (Math.random() * 0.4) - 0.15;

        delete e.disgust;
        delete e.neutral;
        delete e.angry;

        const magnitude = Object.values(e).reduce((acc, val) => acc + val, 0);
        if (magnitude) Object.keys(e).forEach(key => e[key] /= magnitude);
        emotionData = e;
        if (!data) data = e;
    } else emotionData = null;

    if (emotionData) {
        const emotions = Object.keys(emotionData);
        const setEmotionData = (indexToBoost, boostValue = 0.4, normalValue = 0.4) => {
            console.log(`Fake emotion + ${emotions.at(indexToBoost)}`);
            emotions.forEach((emotion, index) => {
                emotionData[emotion] = (index === indexToBoost) ? (Math.random() * boostValue + 0.6) : (Math.random() * normalValue);
            });
        };

        if (0 <= frameCount && frameCount <= 350) {
            setEmotionData(4);
        } else if (frameCount > 350 && frameCount <= 650) {
            setEmotionData(5);
        } else if (frameCount > 1500 && frameCount <= 1950) {
            setEmotionData(0, 0.4, 0.3);
        } else if (frameCount > 3350 && frameCount <= 3800) {
            setEmotionData(1, 0.4, 0.3);
        } else if (frameCount > 4450 && frameCount <= 4900) {
            setEmotionData(4, 0.4, 0.3);
        }
    }
};

function preload() {
    const urlParams = new URLSearchParams(window.location.search);
    sound_to_play = urlParams.get('sound_to_play');
    // sound_to_play = 'sound/uri_male';

    myFont = loadFont('static/font.ttf');

    const imageFiles = ['Net1.png', 'Net2.png', 'Net3.png', 'Net4.png', '003-rivers21.png', '004-shake map2.png',
        'herzFront.png', 'herzBack.png', 'backrounds grain.png'];

    for (let i = 0; i < imageFiles.length; i++) {
        images.push(loadImage(`static/${imageFiles[i]}`));
    }

    for (let i = 0; i < 3; i++) {
        sounds.push(loadSound(`${sound_to_play}_0${i}.mp3`));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    noFill();
    angleMode(DEGREES);
    imageMode(CENTER);
    textFont(myFont);
    textSize(12);
    textAlign(CENTER, CENTER);

    let user_answer

    // Play first sound at the beginning
    sounds[0].play();

    const sound_duration = sounds[0].duration();
    setTimeout(async () => {
        try {
            user_answer = await getUserAnswer();
        } catch (error) {
            user_answer = false
        }
    }, (sound_duration - 10) * 1000);

    // Play sound_2 or sound_3 when first sound ends
    sounds[0].onended(async () => {
        try {
            if (user_answer) {
                console.log('user said: yes');
                sounds[1].play();
            } else {
                console.log('user said: no');
                sounds[2].play();
            }
            targetCameraZ = 100;
        } catch (error) {
            console.error('Speech recognition error:', error);
            sounds[2].play();
        }
    });
    sounds[2].onended(stopRunning);
    sounds[1].onended(stopRunning);
}

function stopRunning() {
    fetch('https://oronp2912.pythonanywhere.com/stop_running')
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function drawLayer(zTranslation, img, rotation, width, height) {
    push();
    translate(0, 0, zTranslation);
    if (img) texture(img);
    noStroke();
    if (rotation) rotateZ(rotation);
    plane(width, height);
    resetShader();
    pop();
}

function drawText(x, y, z, size, message) {
    push();
    translate(x, y, z);
    textFont(myFont);
    textSize(size);
    fill(100, 100, 100);
    text(message, 0, 0);
    pop();
}

function draw() {
    background(220);

    if (cameraZ != targetCameraZ) cameraZ = lerp(cameraZ, targetCameraZ, cameraChangeSpeed);
    translate(0, 0, cameraZ);

    drawLayer(-2000, images[8], null, 7669, 4314);
    drawLayer(-305, null, null, 1920, 1080);
    drawLayer(-300, images[0], frameCount * 0.028, 7680 / 2.5, 5956 / 2.5);
    drawLayer(-250, images[1], frameCount * 0.04, 7680 / 4, 5956 / 4);
    drawLayer(-250, images[2], frameCount * 0.038, 7680 / 5, 5956 / 5);
    drawLayer(-250, images[3], frameCount * 0.03, 7680 / 5.5, 5956 / 5.5);
    drawLayer(-250, images[4], -frameCount * 0.02, 7680 / 5.5, 5956 / 5.5);
    drawLayer(-250, images[5], -frameCount * 0.015, 7680 / 5.5, 5956 / 5.5);
    drawLayer(-210, images[6], null, 7669 / 3.5, 4314 / 3.5);
    drawLayer(-210, images[7], null, 7669 / 3.5, 4314 / 3.5);

    drawText(-200, -120, 200, 5, "+\n365-HZ");
    drawText(50, 50, 500, 2, "+\n826-HZ");
    drawText(-70, -70, 550, 2, "+\n728-HZ");
    drawText(-100, 100, 350, 3, "+\n990-HZ");
    drawText(300, 150, 150, 6, "+\n421-HZ");
    drawText(180, 0, 250, 4, "+\n633-HZ");

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
        coords.push({pos: newPos, size: noise(frameCount / 1) * 17});
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


function putEmotionsText(label, x, y, z, rotateXDeg, rotateYDeg, rotateZDeg) {
    push();
    translate(x, y, z);
    if (rotateXDeg) rotateX(rotateXDeg);
    if (rotateYDeg) rotateY(rotateYDeg);
    if (rotateZDeg) rotateZ(rotateZDeg);
    text(label, 0, 0);
    pop();
}

function putTexts() {
    fill(0);

    putEmotionsText('Fear', ballRadius, 0, 0, 0, -90, 0);
    putEmotionsText('Hope', -ballRadius, 0, 0, 0, 90, 0);
    putEmotionsText('Happy', 0, ballRadius, 0, 90, 0, 180);
    putEmotionsText('Sad', 0, -ballRadius, 0, -90, 0, 180);
    putEmotionsText('Surprised', 0, 0, ballRadius, 0, 180, 0);
    putEmotionsText('Disappointed', 0, 0, -ballRadius, 0, 0, 0);

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
