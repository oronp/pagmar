import cv2
from deepface import DeepFace


class Pagmar:
    def __init__(self, camera_number: int = 0):
        self.camera_number = camera_number
        self.cap = self.init_cam()

        self.axis_center = (0, 0)

    def init_cam(self) -> cv2.VideoCapture:
        cap = cv2.VideoCapture(self.camera_number)  # 0 is usually the default camera
        # Capture single frame to check success.
        if not cap.isOpened():
            raise Exception("Camera could not be opened")
        return cap

    def emotions_predict(self, inputs) -> dict:
        try:
            analysis = DeepFace.analyze(inputs, actions=['emotion'])
            return {'status': True,
                    'values': analysis[0]['emotion']}
        except ValueError:
            return self.no_face_detection()

    def no_face_detection(self):
        # TODO: something here?
        return {'status': False}

    def get_emotions(self) -> None:
        ret, frame = self.cap.read()
        emotions_json = self.emotions_predict(frame)
        # Get emotions out of the image by model inference.
        return emotions_json


