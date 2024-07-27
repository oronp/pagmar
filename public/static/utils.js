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

function getUserAnswer() {
    return new Promise((resolve, reject) => {
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
            console.log('user full is: ' + transcript)
            resolve(transcript.includes("כן"));
        };

        // Handle errors
        recognition.onerror = (event) => {
            reject(event.error);
        };
    });
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
        navigator.mediaDevices.getUserMedia({video: true}).then(function (stream) {
            video.srcObject = stream;
            video.play();
        });
    }

    // Function to capture and send the image
    function captureAndSendImage() {
        context.drawImage(video, 0, 0, 640, 480);
        const imageData = canvas.toDataURL('image/jpeg');

        fetch('https://oronp2912.pythonanywhere.com/detect_emotion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({image: imageData})
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
                fadeOutEffect(() => {
                    window.location.href = 'black_screen.html';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function fadeOutEffect(callback) {
    const fadeTarget = document.getElementById('overlay');
    let opacity = 0;
    let fadeEffect = setInterval(() => {
        if (opacity < 1) {
            opacity += 0.05;
            fadeTarget.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        } else {
            clearInterval(fadeEffect);
            callback();
        }
    }, 50);
}

let emotionPoints

function calculateTargetPoint() {
    if (!emotionPoints) {
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

let rotX, rotY, rotZ

function rotateTowardsTarget(target) {
    // Calculate the rotation needed to move towards the target point
    let axis = p5.Vector.cross(currentPoint, target);
    let axisLength = axis.mag();
    if (axisLength < 1e-6) {
        if (p5.Vector.dot(currentPoint, target) > 0) {
            nextRotX = 0
            nextRotY = 0
            nextRotZ = 0
        } else {
            let perpAxis = createVector(1, 0, 0);
            if (abs(p5.Vector.dot(currentPoint, perpAxis)) > 0.9)
                perpAxis = createVector(0, 1, 0);
            axis = p5.Vector.cross(currentPoint, perpAxis).normalize();
            nextRotX = 180 * axis.x
            nextRotY = 180 * axis.y
            nextRotZ = 180 * axis.z
        }
    }
    const angle = acos(constrain(p5.Vector.dot(currentPoint, target), -1, 1));
    nextRotX = angle * axis.x / axisLength
    nextRotY = angle * axis.y / axisLength
    nextRotZ = angle * axis.z / axisLength
    if (!rotX) {
        rotX = nextRotX;
        rotY = nextRotY;
        rotZ = nextRotZ;
    }
    rotX = lerpAngle(rotX, nextRotX, 0.3)
    rotY = lerpAngle(rotY, nextRotY, 0.3)
    rotZ = lerpAngle(rotZ, nextRotZ, 0.3)
    rotateX(rotX);
    rotateY(rotY);
    rotateZ(rotZ);
}

setInterval(runOrNot, 5000)

function lerpAngle(a, b, t) {
    a = (a + 360) % 360;
    b = (b + 360) % 360;
    let delta = b - a;
    if (Math.abs(delta) > 180) {
        if (delta > 0) delta -= 360;
        else delta += 360;
    }
    return (a + delta * t + 360) % 360;
}
