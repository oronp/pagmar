import time

import requests
import schedule
from yeelight import Bulb, discover_bulbs

# Discover bulbs on the local network
bulbs = discover_bulbs()
if not bulbs:
    raise Exception("No Yeelight bulbs found on the local network.")

# Assuming we are controlling the first bulb discovered
bulb_ip = bulbs[0]['ip']

python_url = 'https://oronp2912.pythonanywhere.com/get_running'


class BulbControl:
    def __init__(self):
        self.bulb = Bulb(bulb_ip)
        self.bulb_is_one = False

    def turn_on(self):
        self.bulb.turn_on()
        self.bulb_is_one = True

    def turn_off(self):
        self.bulb.turn_off()
        self.bulb_is_one = False

    def set_brightness(self, brightness):
        """
        Set the brightness of the bulb.
        Brightness should be an integer between 1 and 100.
        """
        self.bulb.set_brightness(brightness)

    def set_color_temp(self, color_temp):
        """
        Set the color temperature of the bulb.
        Color temperature should be an integer between 1700 and 6500.
        """
        self.bulb.set_color_temp(color_temp)

    def set_rgb_color(self, red, green, blue):
        """
        Set the RGB color of the bulb.
        Red, green, and blue should be integers between 0 and 255.
        """
        self.bulb.set_rgb(red, green, blue)

    def flash(self):
        """
        Flash the bulb on and off for 5 times.
        """
        for _ in range(5):
            self.turn_on()
            time.sleep(0.5)
            self.turn_off()
            time.sleep(0.5)


def send_request():
    try:
        response = requests.get(python_url)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")


if __name__ == "__main__":
    bulb = BulbControl()
    schedule.every(4).seconds.do(send_request)

    while True:
        schedule.run_pending()
        response = send_request()
        if response and response.get('is_running') and not bulb.bulb_is_one:  # check if presentation running and bulb is off
            bulb.turn_on()
        elif response and not response.get('is_running') and bulb.bulb_is_one:  # check if presentation stopped and bulb is on
            bulb.turn_off()
