import cv2
import torch
import pagmar_config
from transformers import AutoModelForImageClassification, AutoFeatureExtractor
from deepface import DeepFace

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class Pagmar:
    def __init__(self, camera_number: int = 0):
        self.camera_number = camera_number
        self.cap = self.init_cam()
        self.background, self.image_shape = self.background_creator('white')

        self.axis_center = (self.image_shape[1]//2, self.image_shape[0]//2)  # (X,Y)
        self.previous_dot = None

    def init_cam(self) -> cv2.VideoCapture:
        cap = cv2.VideoCapture(self.camera_number)  # 0 is usually the default camera
        # Capture single frame to check success.
        if not cap.isOpened():
            raise Exception("Camera could not be opened")
        return cap

    # TODO: seems to be deprecated
    # def init_emotions_model(self) -> tuple:
    #     huggingface_model = AutoModelForImageClassification.from_pretrained(self.emotions_model_name)
    #     huggingface_model.to(device)
    #     extractor = AutoFeatureExtractor.from_pretrained(self.emotions_model_name)
    #
    #     return huggingface_model, extractor

    @staticmethod
    def emotions_predict(inputs) -> dict:
        try:
            analysis = DeepFace.analyze(inputs, actions=['emotion'], enforce_detection=False)
            return analysis[0]['emotion']
        except Exception as e:
            print(f"Error in emotion analysis: {e}")
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
        emotions = list(emotions.values())

        angry_value = int(emotions[0] * 2)  # Y axis
        disgust_value = int(emotions[1] * 3)
        fear_value = int(emotions[2] * 3)
        sad_value = int(emotions[4] * 3)   # X axis
        happy_value = int(emotions[3] * 3)   # X axis
        surprised_value = int(emotions[5] * 2)   # Y axis
        neutral_value = int(emotions[6] * 2)   # Y axis

        dot_x_location = self.axis_center[0] - sad_value + happy_value
        dot_y_location = self.axis_center[1] - angry_value + neutral_value

        cv2.circle(self.background, (dot_x_location, dot_y_location), 2, (0, 0, 0), -1)

        return dot_x_location, dot_y_location

    def connect_dots(self, dot: tuple) -> None:
        cv2.line(self.background, self.previous_dot, dot, (0, 0, 0), 2)

    def video_looper(self) -> None:
        # plot the center of the graph [debug]
        cv2.circle(self.background, (self.axis_center[0], self.axis_center[1]), 5, (100, 100, 1000), -1)

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

    @staticmethod
    def normalize_numbers(numbers_list: list) -> list:
        min_val = min(numbers_list)
        max_val = max(numbers_list)
        range_val = max_val - min_val

        normalized_numbers = [(x - min_val) / range_val for x in numbers_list]
        return normalized_numbers


if __name__ == '__main__':
    Pagmar(0).video_looper()
