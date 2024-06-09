
function onNewEmotionData(data) {}

function getEmotions() {
    fetch('http://127.0.0.1:5000/get-emotions')
        .then(response => {
            response.json()
                .then(data => {
                    onNewEmotionData(data)
                })
                .catch(console.error);
        })
}
function startGetEmotions() {
    setInterval(getEmotions, 250);
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
  
  function rotateTowardsTarget(target) {
    // Calculate the rotation needed to move towards the target point
    let currentPoint = createVector(0, 0, 1); // Assume initial point at (0,0,1)
    let axis = p5.Vector.cross(currentPoint, target);
    let angle = acos(p5.Vector.dot(currentPoint, target));
    
    rotX = angle * axis.x;
    rotY = angle * axis.y;
    rotZ = angle * axis.z;
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