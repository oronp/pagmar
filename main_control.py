import time

import cv2
import torch
import pagmar_config
from transformers import AutoModelForImageClassification, AutoFeatureExtractor

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class Pagmar:
    def __init__(self, emotions_model_name: str, camera_number: int = 0):
        self.emotions_model_name = emotions_model_name
        self.camera_number = camera_number

        self.cap = self.init_cam()
        self.emotions_model, self.feature_extractor = self.init_emotions_model()

        self.background = self.background_creator('white')

        self.image_shape = pagmar_config.IMAGE_SHAPE
        self.axis_center = (self.image_shape[1]//2, self.image_shape[0]//2)  # (X,Y)
        self.previous_dot = None

    def init_cam(self) -> cv2.VideoCapture:
        cap = cv2.VideoCapture(self.camera_number)  # 0 is usually the default camera
        # Capture single frame to check success.
        if not cap.isOpened():
            raise Exception("Camera could not be opened")
        return cap

    def init_emotions_model(self) -> tuple:
        huggingface_model = AutoModelForImageClassification.from_pretrained(self.emotions_model_name)
        huggingface_model.to(device)
        extractor = AutoFeatureExtractor.from_pretrained(self.emotions_model_name)

        return huggingface_model, extractor

    def emotions_predict(self, inputs):
        # Make the prediction
        with torch.no_grad():
            outputs = self.emotions_model(**inputs)

        # Process the model's output, e.g., extracting the predicted emotion
        all_emotions = outputs.logits.tolist()[0]

        return all_emotions

    def background_creator(self, background_color: str):
        cap = cv2.VideoCapture(self.camera_number)  # 0 is usually the default camera
        # Capture single frame to check success.
        _, frame = cap.read()
        # Create a white background to draw the graph on
        background = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        background[:] = pagmar_config.COLORS[background_color][0]  # Make the image white

        return background

    def plot_emotions_dot(self, emotions: list):
        sad_value = int(emotions[0] * 100)
        happy_value = int(emotions[6] * 150)
        fear_value = int(emotions[4] * 150)
        neutral_value = int(emotions[3] * 100)

        dot_x_location = self.axis_center[0] - fear_value + happy_value
        dot_y_location = self.axis_center[1] + sad_value - neutral_value

        cv2.circle(self.background, (dot_x_location, dot_y_location), 2, (0, 0, 0), -1)

        return dot_x_location, dot_y_location

    def connect_dots(self, dot):
        cv2.line(self.background, self.previous_dot, dot, (0, 0, 0), 2)

    def video_looper(self):
        cv2.circle(self.background, (self.axis_center[0], self.axis_center[1]), 5, (100, 100, 1000), -1)

        while True:
            ret, frame = self.cap.read()

            # Convert the image from BGR (OpenCV format) to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Convert the image to tensor
            inputs = self.feature_extractor(images=rgb_frame, return_tensors="pt")
            inputs.to(device)

            # Get emotions out of the image by model inference.
            emotions = self.emotions_predict(inputs)

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
    flow = Pagmar(pagmar_config.EMOTIONS_MODEL_NAME, 0)
    flow.video_looper()
