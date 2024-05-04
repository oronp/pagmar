from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS

from emotion_detection import Pagmar

model = Pagmar(camera_number=0)
app = Flask(__name__)
# CORS(app)  # Enable CORS for the entire app
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins

@app.route('/get-emotions')
def get_emotions():
    emotions = model.get_emotions()
    response = jsonify(emotions)
    response.headers.add('Access-Control-Allow-Origin', '*')  # Set allowed origin
    return response


if __name__ == '__main__':
    app.run()
