from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS

from emotion_detection import Pagmar

model = Pagmar(camera_number=0)
app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

@app.route('/get-emotions')
def get_emotions():
    emotions = model.get_emotions()
    print(emotions)
    return jsonify(emotions)


if __name__ == '__main__':
    app.run()
