var screen_center = [0, 0];
let emotions = {status: false};
var points = [];

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
    let screen_ratio = [1920, 1080]
    createCanvas(screen_ratio[0], screen_ratio[1]);
    screen_center = [screen_ratio[0]/2, screen_ratio[1]/2]
    points.push(screen_center)
}

// Draw everything
function draw() {
    background('black');

    fill("white")
    noStroke()

    if (!emotions.status) return

    neutral = emotions.values.neutral
    text("neutral " + neutral, 20, 20)

    happy = emotions.values.happy
    text("happy " + happy, 20, 40)

    sad = emotions.values.sad
    text("sad " + sad, 20, 60)

    angry = emotions.values.angry
    text("angry " + angry, 20, 80)

    fearful = emotions.values.fear
    text("fearful " + fearful, 20, 100)

    disgusted = emotions.values.disgust
    text("disgusted " + disgusted, 20, 120)

    surprised = emotions.values.surprise
    text("surprised " + surprised, 20, 140)

    dots_locations = emotions.axis_dots
    text("dots locations " + dots_locations, 20, 160)

    draw_line(dots_locations)
}

function draw_line(current_dots) {
    current_dots = [current_dots[0] + screen_center[0], current_dots[1] + screen_center[1]];
    if (points.slice(-1)[0][0] !== current_dots[0] && points.slice(-1)[0][1] !== current_dots[1]){
        points.push(current_dots);
        console.log(current_dots);
    }

    stroke(255);
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
