from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from deepface import DeepFace

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    try:
        # Read the image
        file = request.files['image']
        image_np = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Detect emotion using DeepFace
        result = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']

        return jsonify({"emotion": emotion})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
