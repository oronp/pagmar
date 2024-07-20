
function onNewEmotionData(data) {}

function getEmotions() {
    fetch('http://oronp2912.pythonanywhere.com/get-emotions')
        .then(response => {
            if (response.ok) {
                response.json()
                    .then(data => {
                        onNewEmotionData(data)
                    })
                    .catch(console.error);
            } else {
                onNewEmotionData(false)
            }
        })
}

function getUserAnswer(){
    const recognition = new webkitSpeechRecognition();

    // Set recognition parameters
    recognition.lang = 'he-IL'; // Language for Hebrew
    recognition.continuous = false; // Listen once
    recognition.interimResults = false; // Return only final results

    recognition.start(); // Start listening

    // Stop recognition after 5 seconds
    setTimeout(() => {
        recognition.stop();
    }, 5000);

    // Process the result
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.includes("כן")) {
            resolve(true);
        } else {
            resolve(false);
        }
    };

    // Handle errors
    recognition.onerror = (event) => {
        reject(`Error occurred in recognition: ${event.error}`);
    };
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Create video element
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    video.autoplay = true;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvas.style.display = 'none';

    const context = canvas.getContext('2d');

    // Get access to the webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
            video.srcObject = stream;
            video.play();
        });
    }

    // Function to capture and send the image
    function captureAndSendImage() {
        context.drawImage(video, 0, 0, 640, 480);
        const imageData = canvas.toDataURL('image/jpeg');

        fetch('https://oronp2912.pythonanywhere.com/detect_emotion', {method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ image: imageData })
        }).then(response => {
            if (response.ok) {
                response.json()
                    .then(data => {
                        onNewEmotionData(data)
                    })
                    .catch(console.error);
            } else {
                onNewEmotionData(false)
            }
        });
    }

    // Capture and send an image every second
    setInterval(captureAndSendImage, 1000);
});

function runOrNot() {
    fetch('https://oronp2912.pythonanywhere.com/get_running')
        .then(response => response.json())
        .then(data => {
            if (data.is_running === false) {
                window.location.href = 'black_screen.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

let emotionPoints
function calculateTargetPoint() {
    if (!emotionPoints){
        emotionPoints = [createVector(1, 0, 0),  // hope
            createVector(-1, 0, 0), // fear
            createVector(0, 1, 0),  // sad
            createVector(0, -1, 0), // happy
            createVector(0, 0, 1),  // disappointed
            createVector(0, 0, -1)  // surprised
          ];
    }

    // Calculate weighted average of the emotion points
    let target = createVector(0, 0, 0);
    target.add(p5.Vector.mult(emotionPoints[0], data.hope));
    target.add(p5.Vector.mult(emotionPoints[1], data.fear));
    target.add(p5.Vector.mult(emotionPoints[2], data.sad));
    target.add(p5.Vector.mult(emotionPoints[3], data.happy));
    target.add(p5.Vector.mult(emotionPoints[4], data.disappointment));
    target.add(p5.Vector.mult(emotionPoints[5], data.surprise));

    // add noise according to scribbleForce and scribbleSpeed
    target.add(p5.Vector.random3D().mult(scribbleForce * sin(frameCount * scribbleSpeed / 1000.0) / 100.0));

    // Normalize the target point to keep it on the sphere
    target.normalize();
    return target;
  }

  let rotX,rotY,rotZ
  function rotateTowardsTarget(target) {
    // Calculate the rotation needed to move towards the target point
    let currentPoint = createVector(0, 0, 1); // Assume initial point at (0,0,1)
    let axis = p5.Vector.cross(currentPoint, target);
    let angle = acos(p5.Vector.dot(currentPoint, target));

    n = noise(frameCount * 0.01)
    nextRotX = (angle+(n < .33 ? n : 0)) * axis.x;
    nextRotY = (angle+(n<.66 && n >.33 ? n : 0)) * axis.y;
    nextRotZ = (angle+(n>.66 ? n : 0)) * axis.z;
    if (!rotX) {
     rotX = nextRotX; rotY = nextRotY; rotZ = nextRotZ;
    }
    rotX = lerp(rotX,nextRotX,.3)
    rotY = lerp(rotY,nextRotY,.3)
    rotZ = lerp(rotZ,nextRotZ,.3)
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

setInterval(runOrNot, 5000)