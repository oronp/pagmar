from flask import Flask, jsonify
from flask_cors import CORS

from emotion_detection import Pagmar

model = Pagmar(camera_number=1)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins


@app.route('/get-emotions', methods=['GET'])
def get_emotions():
    emotions = model.get_emotions()
    response = jsonify(emotions)
    return response


if __name__ == '__main__':
    app.run(debug=False)
