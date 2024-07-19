import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import base64
import numpy as np
from emotion_detection import Pagmar

app = Flask(__name__)
model = Pagmar()
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins

persons_voices = {
    0: "nivi",
    1: "uri",
    2: "david",
    3: "nurit",
    4: "uri",
}


def choose_random_voice():
    chosen = random.randint(0, 4)
    chosen = persons_voices[chosen]
    return chosen


@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    try:
        # Read the image from the request
        data = request.get_json()
        image_data = data['image'].split(',')[1]
        npimg = np.fromstring(base64.b64decode(image_data), np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        response = model.get_emotions(frame=img)

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)})


@app.route('/is_running', methods=['GET'])
def is_running():
    return jsonify({'is_running': model.is_running,
                    'name': model.name,
                    'sex': model.sex,
                    'music': model.music})


@app.route('/stop_running', methods=['GET'])
def stop_running():
    model.is_running = False
    return jsonify({'is_running': model.is_running})


@app.route('/start_presentation', methods=['POST'])
def start_presentation():
    model.is_running = True

    name = request.json.get('user_name')
    sex = request.json.get('sex')

    model.name = name
    model.sex = sex
    model.music = f'sound/{choose_random_voice()}_{sex}'
    return jsonify({})


if __name__ == '__main__':
    app.run(debug=False)

