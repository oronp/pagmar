import cv2
import torch
import pagmar_config
from transformers import AutoModelForImageClassification, AutoFeatureExtractor

# Initialize the camera
cap = cv2.VideoCapture(0)  # 0 is usually the default camera

# Load the pre-trained model and feature extractor from Hugging Face
model_name = "dima806/facial_emotions_image_detection"
model = AutoModelForImageClassification.from_pretrained(model_name)
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

    # Make the prediction
    with torch.no_grad():
        outputs = model(**inputs)

    # Process the model's output, e.g., extracting the predicted emotion
    predicted_emotion = outputs.logits.argmax(-1)
    all_emotions = outputs.logits.tolist()[0]

    # Display the resulting frame with the predicted emotion
    for idx, emotion in pagmar_config.ID2LABEL.items():
        cv2.putText(frame,
                    text=f'{emotion}: {all_emotions[idx]}',
                    org=(50, 50+idx*15),
                    fontFace=cv2.FONT_HERSHEY_SIMPLEX,
                    fontScale=0.5,
                    color=(0, 255, 0),
                    thickness=2,
                    lineType=cv2.LINE_AA)

    frame_resized = cv2.resize(frame, (frame.shape[1]*2, frame.shape[0]*2))  # Example: Resize to 1280x720
    cv2.imshow('frame', frame_resized)

    # Break the loop with 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# When everything is done, release the capture
cap.release()
cv2.destroyAllWindows()
