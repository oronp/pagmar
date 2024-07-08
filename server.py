import webbrowser
import subprocess
import os

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS

from emotion_detection import Pagmar
from music_player import sound_flow_manager


class User:
    name: str
    record: str

    def set_user(self, name: str, record: str):
        self.name = name
        self.record = record

    def reset_user(self):
        self.record = None
        self.name = None


user = User()
model = Pagmar(camera_number=1)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins


@app.route('/get-emotions', methods=['GET'])
def get_emotions():
    emotions = model.get_emotions()
    response = jsonify(emotions)
    return response


@app.route('/get-user-id', methods=['GET'])
def set_emotions():
    tmp_user = {'name': user.name, 'record': user.record}
    user.reset_user()
    return tmp_user


@app.route('/set_user_id', methods=['POST'])
def set_user():
    name = request.json.get('user_id')
    record = request.json.get('record')

    user.set_user(name, record)

    response = jsonify({"name": name, "record": record})
    return response


@app.route('/start_presentation', methods=['POST'])
def start_presentation():
    name = request.json.get('user_name')
    sex = request.json.get('sex')

    # chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe %s"  # Windows path
    chrome_path = 'open -a /Applications/Google\ Chrome.app %s'
    webbrowser.get(chrome_path).open_new("http://127.0.0.1:5000/")

    finished = sound_flow_manager(sex)

    return {}


@app.route('/stop_presentation')
def stop_presentation():
    subprocess.run("shutdown -r 0", shell=True, check=True)


@app.route('/')
def index():
    return send_from_directory('static', 'index_Orr.html')


def run_server():
    app.run(debug=False)


if __name__ == '__main__':
    run_server()
