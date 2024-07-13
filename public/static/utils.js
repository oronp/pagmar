
function onNewEmotionData(data) {}

function getEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
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

// Function to capture the image and send it to the server
function captureAndSendImage() {
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Blob
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('image', blob, 'frame.png');

        // Send the image to the server for emotion detection
        fetch('/detect_emotion', {
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
}

function startGetEmotions() {
    // setInterval(getEmotions, 250);
    setInterval(captureAndSendImage, 250)
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