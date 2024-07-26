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
        self.show_is_on = False
        self.ensure_bulb_on_and_set_brightness()

    def ensure_bulb_on_and_set_brightness(self):
        if not self.bulb.get_properties()["power"] == "on":
            self.turn_on()
        if not int(self.bulb.get_properties()["bright"]) == 10:
            self.set_brightness(10)

    def turn_on(self):
        self.bulb.turn_on()
        self.show_is_on = True

    def turn_off(self):
        self.bulb.turn_off()
        self.show_is_on = False

    def brightness_up(self):
        self.set_brightness(40)
        self.show_is_on = True

    def brightness_down(self):
        self.set_brightness(10)
        self.show_is_on = False

    def set_brightness(self, brightness):
        """
        Set the brightness of the bulb.
        Brightness should be a number (round number!!!) between 1 and 100.
        """
        self.bulb.set_brightness(brightness)

    def set_color_temp(self, color_temp):
        """
        Set the color temperature of the bulb.
        Color temperature should be a number (round number!!!) between 1700 and 6500.
        """
        self.bulb.set_color_temp(color_temp)

    def set_rgb_color(self, red, green, blue):
        """
        Set the RGB color of the bulb.
        Red, green, and blue should be numbers (round numbers!!!) between 0 and 255.
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
    # DO NOT COMMENT THIS LINE!!!! #
    bulb = BulbControl()

    schedule.every(4).seconds.do(send_request)

    while True:
        schedule.run_pending()
        response = send_request()
        if response and response.get('is_running') and not bulb.show_is_on:  # check if presentation running and bulb is off
            bulb.brightness_up()
        elif response and not response.get('is_running') and bulb.show_is_on:  # check if presentation stopped and bulb is on
            bulb.brightness_down()
