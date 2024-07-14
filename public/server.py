# import webbrowser
# import subprocess
#
# from flask import Flask, jsonify, send_from_directory, request
# from flask_cors import CORS
#
# from emotion_detection import Pagmar
# from music_player import sound_flow_manager
#
# # TODO: Check if this is relavant
# import cv2
# import numpy as np
# from deepface import DeepFace
#
#
# class User:
#     name: str
#     record: str
#
#     def set_user(self, name: str, record: str):
#         self.name = name
#         self.record = record
#
#     def reset_user(self):
#         self.record = None
#         self.name = None
#
#
# user = User()
# model = Pagmar()
# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins
#
#
# @app.route('/detect_emotion', methods=['POST'])
# def detect_emotion():
#     try:
#         # Read the image from the request
#         file = request.files['image'].read()
#         npimg = np.fromstring(file, np.uint8)
#         img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
#
#         # Analyze the image for emotions
#         result = DeepFace.analyze(img, actions=['emotion'])
#
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({'error': str(e)})
#
#
# @app.route('/get-emotions', methods=['GET'])
# def get_emotions():
#     emotions = model.get_emotions()
#     response = jsonify(emotions)
#     return response
#
#
# @app.route('/get-user-id', methods=['GET'])
# def set_emotions():
#     tmp_user = {'name': user.name, 'record': user.record}
#     user.reset_user()
#     return tmp_user
#
#
# @app.route('/set_user_id', methods=['POST'])
# def set_user():
#     name = request.json.get('user_id')
#     record = request.json.get('record')
#
#     user.set_user(name, record)
#
#     response = jsonify({"name": name, "record": record})
#     return response
#
#
# @app.route('/start_presentation', methods=['POST'])
# def start_presentation():
#     name = request.json.get('user_name')
#     sex = request.json.get('sex')
#
#     # chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe %s"  # Windows path
#     chrome_path = 'open -a /Applications/Google\ Chrome.app %s'
#     webbrowser.get(chrome_path).open_new("http://127.0.0.1:5000/")
#
#     finished = sound_flow_manager(sex)
#
#     return {}
#
#
# @app.route('/stop_presentation')
# def stop_presentation():
#     subprocess.run("shutdown -r 0", shell=True, check=True)
#
#
# @app.route('/')
# def index():
#     return send_from_directory('static', 'index_Orr.html')
#
#
# def run_server():
#     app.run(debug=False)
#
#
# if __name__ == '__main__':
#     run_server()

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import base64
import numpy as np
from music_player import sound_flow_manager
from emotion_detection import Pagmar

app = Flask(__name__)
model = Pagmar()
model.is_running = False
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins


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
    return jsonify({'is_running': model.is_running})


@app.route('/start_presentation', methods=['POST'])
def start_presentation():
    model.is_running = True

    name = request.json.get('user_name')
    sex = request.json.get('sex')

    finished = sound_flow_manager(sex)

    if finished:
        model.is_running = False

    # TODO: add here the return of the data to the visual.
    return {}


if __name__ == '__main__':
    app.run(debug=False)

