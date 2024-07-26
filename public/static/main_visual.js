let emotionData, data, sound_1, sound_2, sound_3;
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

    const images = ['Net1', 'Net2', 'Net3', 'Net4', '003-rivers21', '004-shake map2', 'herzFront', 'herzBack', 'backrounds grain'];
    images.forEach((image, index) => {
        window[`image0${index + 1}`] = loadImage(`static/${image}.png`);
    });

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

    const stopRunning = () => {
        fetch('https://oronp2912.pythonanywhere.com/stop_running')
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    sound_2.onended(stopRunning);
    sound_3.onended(stopRunning);
}

function draw() {
    background(220);

    if (cameraZ !== targetCameraZ) cameraZ = lerp(cameraZ, targetCameraZ, cameraChangeSpeed);
    translate(0, 0, cameraZ);

    /// ----------------
    // ----- LAYER 00 -----
    renderLayer(image09, -2000, 0.07, 7669, 4314);

    /// ----------------
    // ----- LAYER 1 -----
    renderLayer(null, -305, 0, 1920, 1080);

    // -----------------
    // ------- LAYER 2 -----
    renderLayer(image01, -300, 0.028, 7680 / 2.5, 5956 / 2.5);

    // -----------------
    // ------- LAYER 3 -----
    renderLayer(image02, -250, 0.04, 7680 / 4, 5956 / 4);

    // -----------------
    // ------- LAYER 4 -----
    renderLayer(image03, -250, 0.038, 7680 / 5, 5956 / 5);

    // -----------------
    // ------- LAYER 5 -----
    renderLayer(image04, -250, 0.03, 7680 / 5.5, 5956 / 5.5);

    // -----------------
    // ------- LAYER 6 -----
    renderLayer(image05, -250, -0.02, 7680 / 5.5, 5956 / 5.5);

    // -----------------
    // ------- LAYER 7 -----
    renderLayer(image06, -250, -0.015, 7680 / 5.5, 5956 / 5.5);

    // -----------------
    // ------- LAYER 8 -----
    renderLayer(image07, -210, 0, 7669 / 3.5, 4314 / 3.5);

    // -----------------
    // ------- LAYER 9 -----
    renderLayer(image08, -210, 0, 7669 / 3.5, 4314 / 3.5);

    renderTexts();

    rotateY(map(cameraZ, 0, 800, 0, 180));

    if (emotionData) {
        holeR = 0;
        Object.keys(emotionData).forEach((key) => {
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
    let newPos = calculateFixedPoint(0, 0, r);
    if (emotionData) coords.push({ pos: newPos, size: noise(frameCount / 5) * 3 + 0.5 });
    else if (frameCount % 5 === 0) {
        // if not found a face - rotate slightly using rotationAmout
        let rotationAmount = expansionRate / 2;
        const angleX = random(-rotationAmount, rotationAmount);
        const angleY = random(-rotationAmount, rotationAmount);
        const angleZ = random(-rotationAmount, rotationAmount);

        newPos = rotateVector(newPos, angleX, angleY, angleZ);
        // this is the new random 'hole' point and its size
        coords.push({ pos: newPos, size: noise(frameCount / 30) * 28 });
    }

    // draw the points
    stroke(0);
    const stepSize = targetCameraZ === 800 ? 1 : 1;
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

function renderLayer(layer_texture, zTranslate, rotationSpeed, width, height) {
    push();
    translate(0, 0, zTranslate);
    if (layer_texture) texture(layer_texture);
    noStroke();
    rotateZ(frameCount * rotationSpeed);
    plane(width, height);
    resetShader();
    pop();
}

function renderTexts() {
    const texts = [
        { raw_text: "+\n365-HZ", x: -200, y: -120, z: 200, size: 5 },
        { raw_text: "+\n826-HZ", x: 50, y: 50, z: 500, size: 2 },
        { raw_text: "+\n728-HZ", x: -70, y: -70, z: 550, size: 2 },
        { raw_text: "+\n990-HZ", x: -100, y: 100, z: 350, size: 3 },
        { raw_text: "+\n421-HZ", x: 300, y: 150, z: 150, size: 6 },
        { raw_text: "+\n633-HZ", x: 180, y: 0, z: 250, size: 4 },
    ];

    texts.forEach(({ raw_text, x, y, z, size }) => {
        push();
        translate(x, y, z);
        textFont(myFont);
        textSize(size);
        fill(100, 100, 100);
        text(raw_text, 0, 0);
        pop();
    });
}

function calculateFixedPoint(x, y, z) {
    let point = createVector(x, y, z);
    point = inverseRotateX(point, -rotX);
    point = inverseRotateY(point, -rotY);
    point = inverseRotateZ(point, -rotZ);
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
    if (key === ' ') {
        targetCameraZ = (targetCameraZ === 800) ? 100 : 800;
    }
    if (key === 'p') {
        video1.play();
    }
}

function putTexts() {
    const positions = [
        { text: 'Fear', x: ballRadius, y: 0, z: 0, rotate: [-90, 0, 0] },
        { text: 'Hope', x: -ballRadius, y: 0, z: 0, rotate: [90, 0, 0] },
        { text: 'Happy', x: 0, y: ballRadius, z: 0, rotate: [90, 180, 0] },
        { text: 'Sad', x: 0, y: -ballRadius, z: 0, rotate: [-90, 180, 0] },
        { text: 'Disappointed', x: 0, y: 0, z: ballRadius, rotate: [0, 180, 0] },
        { text: 'Surprise', x: 0, y: 0, z: -ballRadius, rotate: [0, 0, 0] },
    ];

    fill(0);
    positions.forEach(({ text, x, y, z, rotate }) => {
        push();
        translate(x, y, z);
        rotateY(rotate[0]);
        rotateX(rotate[1]);
        rotateZ(rotate[2]);
        text(text, 0, 0);
        pop();
    });
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
