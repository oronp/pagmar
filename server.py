from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS

from emotion_detection import Pagmar


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
model = Pagmar(camera_number=0)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow CORS for all origins


@app.route('/get-emotions', methods=['GET'])
def get_emotions():
    emotions = model.get_emotions()
    response = jsonify(emotions)
    return response


@app.route('/get-user-id', methods=['GET'])
def get_emotions():
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


@app.route('/')
def index():
    return send_from_directory('static', 'index_Orr.html')


if __name__ == '__main__':
    app.run(debug=False)
