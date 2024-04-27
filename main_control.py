import turtle
import os
import cv2
import math
from deepface import DeepFace

import pagmar_config
import tools


class Pagmar:
    def __init__(self, camera_number: int = 0):
        self.line_drawer = turtle.Turtle(visible=False)
        self.line_drawer.speed(6)
        self.line_drawer.color(pagmar_config.COLORS['black'])

        self.camera_number = camera_number
        self.cap = self.init_cam()

        self.screen = self.background_creator_with_emotion()

        self.axis_center = (0, 0)
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

    def background_creator_with_emotion(self) -> turtle.Screen:
        screen = turtle.Screen()
        screen.bgpic(os.path.join(os.getcwd(), 'files', 'background_image.gif'))
        screen.setup(1.0, 1.0)
        screen.update()

        return screen

    def plot_emotions_dot(self, emotions: dict) -> tuple:
        emotions = tools.order_emotions_dict(emotions)
        emotions = list(emotions.values())
        dot_x_location, dot_y_location = self.axis_center

        dot_x_location += emotions[0]*4 - emotions[3]*4 + emotions[5]*2
        dot_y_location += emotions[2]*4 - emotions[4]*4 - emotions[5]*2

        # plot must be int because it presents a pixel location.
        dot_x_location = int(dot_x_location)
        dot_y_location = int(dot_y_location)

        return dot_x_location, dot_y_location

    def draw_line_between_dots(self, dot: tuple) -> None:
        self.line_drawer.goto(dot[0], dot[1])

    def video_looper(self) -> None:
        while True:
            ret, frame = self.cap.read()

            # Get emotions out of the image by model inference.
            emotions = self.emotions_predict(frame)

            current_dot = self.plot_emotions_dot(emotions)

            if self.previous_dot:
                self.draw_line_between_dots(current_dot)

            self.previous_dot = current_dot

            self.screen.listen()  # Listen to keyboard events
            self.screen.onkeypress(self.screen.bye, "q")


if __name__ == '__main__':
    Pagmar(1).video_looper()
