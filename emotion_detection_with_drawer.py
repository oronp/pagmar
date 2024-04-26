import cv2
import torch
import pagmar_config
from transformers import AutoModelForImageClassification, AutoFeatureExtractor

# Initialize the camera
cap = cv2.VideoCapture(0)  # 0 is usually the default camera
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the pre-trained model and feature extractor from Hugging Face
model_name = "dima806/facial_emotions_image_detection"
model = AutoModelForImageClassification.from_pretrained(model_name)
model.to(device)
feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break

    # Convert the image from BGR (OpenCV format) to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Preprocess the image
    inputs = feature_extractor(images=rgb_frame, return_tensors="pt")
    inputs.to(device)

    # Make the prediction
    with torch.no_grad():
        outputs = model(**inputs)

    # Process the model's output, e.g., extracting the predicted emotion
    all_emotions = outputs.logits.tolist()[0]

    # Create a white image to draw the graph on
    graph_img = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    graph_img[:] = 255  # Make the image white

    # Set graph size and get the 'sad' and 'happy' values
    graph_height, graph_width = graph_img.shape

    sad_value = all_emotions[0] * 300
    happy_value = all_emotions[6] * 200
    # fear
    # neutral

    # Check boundaries
    sad_value = int(sad_value)
    happy_value = int(happy_value)

    # Plot the 'sad' and 'happy' values as a white dot
    cv2.circle(graph_img, (sad_value, happy_value), 5, (0, 0, 0), -1)

    # Display the graph
    cv2.imshow('Emotion Graph', graph_img)

    # Break the loop with 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# When everything is done, release the capture
cap.release()
cv2.destroyAllWindows()
