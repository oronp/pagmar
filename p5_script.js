var screen_center = [0, 0];
let emotions = {status: false};
var points = [];


function preload(){
    bgImage = loadImage('files/background.png')
}

function fetchEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => response.json())
        .then(data => {
            // console.log('Emotion Data:', data);
            emotions = data
            // Process and display emotions here
        })
        .catch(console.error);
}

setInterval(fetchEmotions, 250); // Update 4 times a second

function setup() {
    let screen_ratio = [1080, 1080]
    createCanvas(screen_ratio[0], screen_ratio[1])
    screen_center = [screen_ratio[0]/2, screen_ratio[1]/2]
    points.push(screen_center)
}

// Draw everything
function draw() {
    background('white');
    //image(bgImage, 0, 0, width, height)

    fill("black")
    noStroke()


    if (!emotions.status){
        no_face_detection()
    }
    else {
        dots_locations = emotions.axis_dots
        draw_line(dots_locations)
    }
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
    text('no face detection', 20, 20, 20)
    // This is the end of the function -> you can replace everything between those comments.
}
