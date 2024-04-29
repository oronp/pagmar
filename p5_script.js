let emotions

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

setInterval(fetchEmotions, 1000); // Update every second

function setup() {
    createCanvas(360, 270);
}

// Draw everything
function draw() {
    background('black');

    fill("white")
    noStroke()

    if (!emotions) return

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
}
