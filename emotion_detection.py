import cv2
from deepface import DeepFace
import tools


class Pagmar:
    def __init__(self, camera_number: int = 0):
        self.camera_number = camera_number
        self.cap = self.init_cam()

        self.axis_center = (0, 0)

    def init_cam(self) -> cv2.VideoCapture:
        cap = cv2.VideoCapture(self.camera_number)
        if not cap.isOpened():
            raise Exception("Camera could not be opened")
        return cap
    
    def emotions_predict(self, inputs) -> dict:
        try:
            analysis = DeepFace.analyze(inputs, actions=['emotion'])
            if (len(analysis) == 0):
                return {'status': False}
            analysis[0]['status'] = True
            return analysis[0]
        except ValueError:
            return {'status': False}




    def plot_emotions_dot(self, emotions: dict) -> tuple:
        emotions = tools.order_emotions_dict(emotions)
        emotions = list(emotions.values())
        dot_x_location, dot_y_location = self.axis_center

        dot_x_location += emotions[0]*4 - emotions[3]*4 + emotions[5]*2 + emotions[1]*2
        dot_y_location += emotions[2]*4 - emotions[4]*4 - emotions[5]*2 + emotions[1]*2

        # plot must be int because it presents a pixel location.
        dot_x_location = int(dot_x_location)
        dot_y_location = int(dot_y_location)

        return dot_x_location, dot_y_location

    def get_emotions(self) -> dict:
        ret, frame = self.cap.read()
        emotions_json = self.emotions_predict(frame)
        # if emotions_json['status']:
            # emotions_json['axis_dots'] = self.plot_emotions_dot(emotions_json['values'])
        # make the emotions be bigger and more aggressive.
        emotions_json['emotion'] = {key: value * 6 for key, value in emotions_json['emotion'].items()}
        return emotions_json


