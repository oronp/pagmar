import tkinter as tk
import random
from tkinter import messagebox
from tkinter import ttk
from functools import partial
import requests

screen_width = 400
screen_height = 600

persons_voices = {
    0: "Nivi",
    1: "Oori",
    2: "David",
    3: "Noorit",
    4: "Oori",
}


def choose_random_person_voice():
    chosen = random.randint(0, 4)
    chosen = persons_voices[chosen]
    return chosen


# Define button click functions
def send_user_id(sex: str):
    name = name_var.get()
    record = f'{choose_random_person_voice()}_{sex}'
    try:
        response = requests.post("http://127.0.0.1:5000/send_user_id", json={"name": name, 'record': record})
        if response.status_code == 200:
            messagebox.showinfo("Success", "Request was successful!")
        else:
            messagebox.showerror("Error", f"Request failed with status code {response.status_code}")
    except requests.RequestException as e:
        messagebox.showerror("Error", f"Request failed: {e}")


def start_button_click():
    try:
        response = requests.post("http://127.0.0.1:5000/start_motion", json={"Start": True})
        if response.status_code == 200:
            messagebox.showinfo("Success", "Request was successful!")
        else:
            messagebox.showerror("Error", f"Request failed with status code {response.status_code}")
    except requests.RequestException as e:
        messagebox.showerror("Error", f"Request failed: {e}")


def create_button(frame, text, onclick_function, sex: str, pady=5, padx=5):
    new_button = ttk.Button(frame, text=text, command=partial(onclick_function, sex))
    new_button.pack(pady=pady, padx=padx)

    return new_button


if __name__ == '__main__':
    # Create the main application window
    root = tk.Tk()
    root.title("Starting Screen")

    # Set the window size
    root.geometry(f"{screen_width}x{screen_height}")

    # Configure the style
    style = ttk.Style()
    style.theme_use('clam')

    style.configure('TButton', font=('Helvetica', 12, 'bold'), padding=10, background='#4CAF50', foreground='white')
    style.map('TButton', background=[('active', '#45a049')], foreground=[('active', 'white')])

    style.configure('TEntry', font=('Helvetica', 12), padding=5)
    style.configure('TLabel', font=('Helvetica', 14), padding=10)

    # Create a frame to hold the widgets
    frame = ttk.Frame(root, padding="20", style='TFrame')
    frame.pack(fill='both', expand=True)

    # Create a placeholder (Entry widget) for inputting a name
    name_var = tk.StringVar()
    name_label = ttk.Label(frame, text="Enter your name:")
    name_label.pack(pady=5)
    name_entry = ttk.Entry(frame, textvariable=name_var, width=30)
    name_entry.pack(pady=10)

    # Create buttons and assign click functions
    male_button = create_button(frame, "זכר", send_user_id, 'male')
    female_button = create_button(frame, "נקבה", send_user_id, 'female')
    start_button = create_button(frame, "Start", start_button_click, '')

    # Set background color for the main window and frame
    root.configure(bg='#f0f0f0')
    frame.configure(style='TFrame', relief='solid')

    # Run the application
    root.mainloop()
