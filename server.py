from flask import Flask, jsonify, request
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
    print(f'got user -> {name}')

    response = jsonify(name)
    return response


if __name__ == '__main__':
    app.run(debug=False)
