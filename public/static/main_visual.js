let emotionData, data, sound_1, sound_2, sound_3;
var name;
let ballRadius = 200;
let r = 200;
let holeR = 0;
let extraRotation = 0;
let scribbleForce = 4;
let scribbleSpeed = 0.2;
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

    if (frameCount % 1000 === 0 && emotionData) {
        let emotions = Object.keys(emotionData);
        let validIndices = [0, 3, 4];
        let randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
        emotions.forEach((emotion, index) => {
            emotionData[emotion] = (index === randomIndex) ? 1 : 0;
        });
    }
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

    if (cameraZ != targetCameraZ) cameraZ = lerp(cameraZ, targetCameraZ, cameraChangeSpeed);
    translate(0, 0, cameraZ);

    // Draw layers
    drawLayers();

    // Display the "Hertz" in the space
    displayHertz();

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

    // Get the new point
    let newPos = calculateFixedPoint(0, 0, r);
    if (emotionData) {
        coords.push({ pos: newPos, size: noise(frameCount / 5) * 3 + 0.5 });
    } else if (frameCount % 5 == 0) {
        // If not found a face - rotate slightly using rotationAmount
        let rotationAmount = expansionRate / 2;
        const angleX = random(-rotationAmount, rotationAmount);
        const angleY = random(-rotationAmount, rotationAmount);
        const angleZ = random(-rotationAmount, rotationAmount);

        newPos = rotateVector(newPos, angleX, angleY, angleZ);
        // This is the new random 'hole' point and its size
        coords.push({ pos: newPos, size: noise(frameCount / 30) * 28 });
    }

    // Draw the points
    stroke(0);
    drawPoints();
}

function drawLayers() {
    const layers = [
        { z: -2000, img: image09, size: [7669, 4314], rotSpeed: 0.07 },
        { z: -305, img: null, size: [1920, 1080], rotSpeed: 0 },
        { z: -300, img: image01, size: [7680 / 2.5, 5956 / 2.5], rotSpeed: 0.028 },
        { z: -250, img: image02, size: [7680 / 4, 5956 / 4], rotSpeed: 0.04 },
        { z: -250, img: image03, size: [7680 / 5, 5956 / 5], rotSpeed: 0.038 },
        { z: -250, img: image04, size: [7680 / 5.5, 5956 / 5.5], rotSpeed: 0.03 },
        { z: -250, img: image05, size: [7680 / 5.5, 5956 / 5.5], rotSpeed: -0.02 },
        { z: -250, img: image06, size: [7680 / 5.5, 5956 / 5.5], rotSpeed: -0.015 },
        { z: -210, img: image07, size: [7669 / 3.5, 4314 / 3.5], rotSpeed: 0 },
        { z: -210, img: image08, size: [7669 / 3.5, 4314 / 3.5], rotSpeed: 0 },
    ];

    for (const layer of layers) {
        push();
        translate(0, 0, layer.z);
        if (layer.img) texture(layer.img);
        noStroke();
        rotateZ(frameCount * layer.rotSpeed);
        plane(...layer.size);
        resetShader();
        pop();
    }
}

function displayHertz() {
    const hertzTexts = [
        { x: -200, y: -120, z: 200, size: 5, text: "+\n365-HZ" },
        { x: 50, y: 50, z: 500, size: 2, text: "+\n826-HZ" },
        { x: -70, y: -70, z: 550, size: 2, text: "+\n728-HZ" },
        { x: -100, y: 100, z: 350, size: 2, text: "+\n528-HZ" },
        { x: -200, y: -220, z: 100, size: 2, text: "+\n423-HZ" },
    ];

    for (const ht of hertzTexts) {
        push();
        translate(ht.x, ht.y, ht.z);
        rotateZ(frameCount * 0.1);
        rotateX(frameCount * 0.1);
        rotateY(frameCount * 0.1);
        textSize(2 + ht.size * sin(frameCount / 5));
        text(ht.text, 0, 0);
        pop();
    }
}

function calculateTargetPoint() {
    return createVector(
        data.happy - data.sad,
        data.hope - data.disappointment,
        data.surprise - data.fear
    ).normalize().mult(r);
}

function rotateTowardsTarget(targetPoint) {
    let currentPoint = calculateFixedPoint(0, 0, r);
    let rotationAxis = p5.Vector.cross(currentPoint, targetPoint).normalize();
    let rotationAngle = degrees(acos(p5.Vector.dot(currentPoint.normalize(), targetPoint.normalize())));
    rotate(rotationAngle, rotationAxis);
}

function putTexts() {
    push();
    rotateX(90);
    for (const [key, value] of Object.entries(data)) {
        rotateZ(360 / Object.keys(data).length);
        translate(0, 0, r + 40);
        rotateZ(90);
        rotateX(90);
        fill(0);
        textSize(14 + 5 * value);
        text(key, 0, 0);
        resetShader();
    }
    pop();
}

function drawPoints() {
    for (let i = 0; i < coords.length; i++) {
        let point = coords[i];
        const prevIndex = i === 0 ? coords.length - 1 : i - 1;
        const prevPoint = coords[prevIndex];

        const distance = dist(point.pos.x, point.pos.y, point.pos.z, prevPoint.pos.x, prevPoint.pos.y, prevPoint.pos.z);
        const stepSize = max(1, 5 - distance / 20);

        strokeWeight(point.size);
        for (let j = 0; j < distance; j += stepSize) {
            const t = j / distance;
            const interPos = p5.Vector.lerp(prevPoint.pos, point.pos, t);
            point(interPos.x, interPos.y, interPos.z);
        }
    }
}

function calculateFixedPoint(x, y, z) {
    let d = dist(0, 0, 0, x, y, z);
    return createVector(x, y, z).mult(r / d);
}

function rotateVector(v, angleX, angleY, angleZ) {
    let rotatedVector = v.copy();
    rotatedVector = createVector(
        rotatedVector.x,
        rotatedVector.y * cos(angleX) - rotatedVector.z * sin(angleX),
        rotatedVector.y * sin(angleX) + rotatedVector.z * cos(angleX)
    );
    rotatedVector = createVector(
        rotatedVector.x * cos(angleY) + rotatedVector.z * sin(angleY),
        rotatedVector.y,
        -rotatedVector.x * sin(angleY) + rotatedVector.z * cos(angleY)
    );
    rotatedVector = createVector(
        rotatedVector.x * cos(angleZ) - rotatedVector.y * sin(angleZ),
        rotatedVector.x * sin(angleZ) + rotatedVector.y * cos(angleZ),
        rotatedVector.z
    );
    return rotatedVector;
}
