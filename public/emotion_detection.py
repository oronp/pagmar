from deepface import DeepFace

import tools


class Pagmar:
    def __init__(self):
        self.is_running = False
        self.name: str = ''
        self.sex: str = ''
        self.music: str = ''
        self.axis_center = (0, 0)
        self.number_of_calls = 0

    @staticmethod
    def emotions_predict(inputs) -> dict:
        try:
            analysis = DeepFace.analyze(inputs, actions=['emotion'])
            if (len(analysis) == 0):
                return {'status': False}
            analysis[0]['status'] = True
            return analysis[0]
        except ValueError:
            return {'status': False}

    def update_number_of_calls(self) -> None:
        self.number_of_calls += 1
        if self.number_of_calls > 30:
            self.number_of_calls = 0


    def plot_emotions_dot(self, emotions: dict) -> tuple:
        emotions = tools.order_emotions_dict(emotions)
        emotions = list(emotions.values())
        dot_x_location, dot_y_location = self.axis_center

        dot_x_location += emotions[0] * 4 - emotions[3] * 4 + emotions[5] * 2 + emotions[1] * 2
        dot_y_location += emotions[2] * 4 - emotions[4] * 4 - emotions[5] * 2 + emotions[1] * 2

        # plot must be int because it presents a pixel location.
        dot_x_location = int(dot_x_location)
        dot_y_location = int(dot_y_location)

        return dot_x_location, dot_y_location

    def get_emotions(self, frame) -> dict:
        emotions_json = self.emotions_predict(frame)
        emotions_json['emotion'] = {key: value * 10 for key, value in emotions_json['emotion'].items()}
        return emotions_json
