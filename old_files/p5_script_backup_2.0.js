var screen_center = [0, 0];
let emotions = {status: false};
var points = [];

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const resultDiv = document.getElementById('result');

// Access the device camera and stream to video element
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error('Error accessing the camera: ', err);
    });

// Capture the image from the video stream
captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Blob
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob, 'frame.png');

        // Send the image to the server for emotion detection
        fetch('/detect-emotions', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultDiv.innerText = `Error: ${data.error}`;
            } else {
                resultDiv.innerText = `Emotion: ${data[0].dominant_emotion}`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resultDiv.innerText = 'Error detecting emotion.';
        });
    }, 'image/png');
});

directionEase = 0.1
speedEase = 0.05


function preload(){
    bgImage = loadImage('static/background.png')
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
    createCanvas(screen_ratio[0], screen_ratio[1])
    angleMode(DEGREES)
    screen_center = [screen_ratio[0]/2, screen_ratio[1]/2]
    points.push(screen_center)
    background(255);

    position = createVector(width/2,height/2)
    direction = createVector(0,1)

    splashSize = 0
}

// Draw everything
function draw() {
    // translate(-width/2,-height/2)

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

    // nextPosition = p5.Vector.lerp(position,nextTarget, .05)
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

    // Pass through all points with curveVertex
    for (let i = 0; i < points.length; i++) {
        curveVertex(points[i][0], points[i][1]);
    }

    // Add the last point again to act as the control point
    if (points.length > 1) {
        curveVertex(points[points.length - 1][0], points[points.length - 1][1]);
    }

    endShape();
}

function no_face_detection(){
    // This area is a spacial place where you can put the code you want to do whatever you want to do in your code later.
    // text('no face detection', 20, 20, 20)
    // This is the end of the function -> you can replace everything between those comments.
    fill(0,10)
    noStroke()
    splashSize = splashSize + 0.1
    // circle(position.x,position.y, splashSize)

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
