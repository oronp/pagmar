import tkinter as tk
from tkinter import ttk
from tkinter import messagebox
import requests
import webbrowser

# Create the main application window
root = tk.Tk()
root.title("Enhanced GUI")

# Set the window size
root.geometry("400x600")

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


# Define button click functions
def on_button1_click():
    name = name_var.get()
    try:
        response = requests.post("http://127.0.0.1:5000/send_user_id", json={"name": name})
        if response.status_code == 200:
            messagebox.showinfo("Success", "Request was successful!")
        else:
            messagebox.showerror("Error", f"Request failed with status code {response.status_code}")
    except requests.RequestException as e:
        messagebox.showerror("Error", f"Request failed: {e}")


def on_button2_click():
    try:
        response = requests.post("http://127.0.0.1:5000/start_motion", json={"Start": True})
        if response.status_code == 200:
            messagebox.showinfo("Success", "Request was successful!")
        else:
            messagebox.showerror("Error", f"Request failed with status code {response.status_code}")
    except requests.RequestException as e:
        messagebox.showerror("Error", f"Request failed: {e}")
    # name = name_var.get()
    # messagebox.showinfo("Button 2 Clicked", f"Goodbye, {name}!")


# Create two buttons and assign click functions
button1 = ttk.Button(frame, text="Set name", command=on_button1_click)
button1.pack(pady=5)

button2 = ttk.Button(frame, text="Start", command=on_button2_click)
button2.pack(pady=5)

# Set background color for the main window and frame
root.configure(bg='#f0f0f0')
frame.configure(style='TFrame', relief='solid')

# Run the application
root.mainloop()