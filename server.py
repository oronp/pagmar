from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS

from emotion_detection import Pagmar

model = Pagmar(camera_number=0)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins


@app.route('/get-emotions', methods=['GET'])
def get_emotions():
    emotions = model.get_emotions()
    response = jsonify(emotions)
    return response


@app.route('/send_user_id', methods=['POST'])
def set_user():
    name = request.json.get('user_id')
    record = request.json.get('record')

    response = jsonify({"name": name, "record": record})
    return response


@app.route('/start', methods=['GET'])
def start():
    data = model.start()
    response = jsonify(data)
    return response


@app.route('/')
def index():
    return send_from_directory('static', 'index_Orr.html')


if __name__ == '__main__':
    app.run(debug=False)
