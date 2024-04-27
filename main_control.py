import cv2
import math
from deepface import DeepFace

import pagmar_config
import tools


class Pagmar:
    def __init__(self, camera_number: int = 0):
        self.camera_number = camera_number
        self.cap = self.init_cam()
        self.background, self.image_shape = self.background_creator('white')

        self.axis_center = (self.image_shape[1] // 2, self.image_shape[0] // 2)  # (X,Y)
        self.previous_dot = None

    def init_cam(self) -> cv2.VideoCapture:
        cap = cv2.VideoCapture(self.camera_number)  # 0 is usually the default camera
        # Capture single frame to check success.
        if not cap.isOpened():
            raise Exception("Camera could not be opened")
        return cap

    @staticmethod
    def emotions_predict(inputs) -> dict:
        try:
            analysis = DeepFace.analyze(inputs, actions=['emotion'], enforce_detection=False)
            return analysis[0]['emotion']
        except Exception as e:
            # TODO: send to no detection function
            return "No Face Detected"

    def background_creator(self, background_color: str):
        cap = cv2.VideoCapture(self.camera_number)  # 0 is usually the default camera
        # Capture single frame to check success.
        _, frame = cap.read()
        # Create a white background to draw the graph on
        background = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        background[:] = pagmar_config.COLORS[background_color][0]  # Make the image white

        return background, frame.shape[:2]

    def plot_emotions_dot(self, emotions: dict) -> tuple:
        emotions = tools.order_emotions_dict(emotions)
        emotions = list(emotions.values())
        dot_x_location, dot_y_location = self.axis_center

        for angle, emotion in enumerate(emotions):
            dot_y_location += emotion * math.sin(angle * 60) * 2
            dot_x_location += emotion * math.cos(angle * 60) * 2

        dot_x_location = int(dot_x_location)
        dot_y_location = int(dot_y_location)
        # In case you want to plot the dot.
        cv2.circle(self.background, (dot_x_location, dot_y_location), 1, pagmar_config.COLORS['black'], -1)

        return dot_x_location, dot_y_location

    def connect_dots(self, dot: tuple) -> None:
        cv2.line(self.background, self.previous_dot, dot, (0, 0, 0), 1)

    def video_looper(self) -> None:
        # plot the center of the graph [debug]
        cv2.circle(self.background, (self.axis_center[0], self.axis_center[1]), 5, pagmar_config.COLORS['gray'], -1)

        while True:
            ret, frame = self.cap.read()

            # Get emotions out of the image by model inference.
            emotions = self.emotions_predict(frame)

            current_dot = self.plot_emotions_dot(emotions)

            if self.previous_dot:
                self.connect_dots(current_dot)

            self.previous_dot = current_dot

            cv2.imshow('Emotion Graph', self.background)

            # Break the loop with 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        # When everything is done, release the capture
        self.cap.release()
        cv2.destroyAllWindows()


if __name__ == '__main__':
    Pagmar(0).video_looper()
