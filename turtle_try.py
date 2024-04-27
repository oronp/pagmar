import turtle
import random

# Setup the screen
screen = turtle.Screen()
screen.bgcolor("white")
screen.title("Animated Line Drawing")

# Create a turtle object
line_drawer = turtle.Turtle()
line_drawer.speed(0.5)  # Maximum drawing speed

# Function to draw a line with random length and angle
def draw_random_line():
    # Set a random color
    line_drawer.color(random.random(), random.random(), random.random())
    # Pick a random length between 50 and 150
    length = random.randint(50, 150)
    # Turn the turtle to a random angle
    line_drawer.right(random.randint(0, 360))
    # Move the turtle forward
    line_drawer.forward(length)
    # Lift the pen up, move to a new random position, and put the pen down
    line_drawer.penup()
    line_drawer.goto(random.randint(-300, 300), random.randint(-300, 300))
    line_drawer.pendown()

# Draw 50 lines
for _ in range(50):
    draw_random_line()

# Hide the turtle and finish
line_drawer.hideturtle()

# Keep the window open until it is closed by the user
screen.mainloop()
