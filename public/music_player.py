import pygame
import time
import random


persons_voices = {
    0: "nivi",
    1: "uri",
    2: "david",
    3: "nurit",
    4: "uri",
}


def play_mp3(file_path):
    # Initialize the mixer module in pygame
    pygame.mixer.init()

    # Load the mp3 file
    pygame.mixer.music.load(file_path)

    # Play the mp3 file
    pygame.mixer.music.play()

    # Wait for the music to finish playing
    while pygame.mixer.music.get_busy():
        time.sleep(0)

    # Quit the mixer module
    pygame.mixer.quit()


def choose_random_voice():
    chosen = random.randint(0, 4)
    chosen = persons_voices[chosen]
    return chosen


def sound_flow_manager(sex: str):
    actor_name = choose_random_voice()
    actor_name = 'david'

    sounds_dir = 'sound'

    # first talk
    play_mp3(f'{sounds_dir}/{actor_name}_{sex}_00.mp3')

    # waiting for answer from model
    # TODO: add yes no model here
    play_mp3(f'{sounds_dir}/{actor_name}_{sex}_02.mp3')

    return True
