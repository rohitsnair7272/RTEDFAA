from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import cv2
import numpy as np
from typing import Dict

app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with allowed frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "FastAPI Server Running!"}

@app.post("/detect_emotion")
async def detect_emotion(image: UploadFile = File(...)) -> Dict[str, str]:
    try:
        # Read and convert image
        image_bytes = await image.read()
        image_array = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format. Please upload a valid image.")

        # Convert BGR to RGB (DeepFace expects RGB images)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Detect Emotion using DeepFace
        result = DeepFace.analyze(
            img_rgb, 
            actions=["emotion"], 
            enforce_detection=False,  # Avoid crashes if no face is detected
            detector_backend="opencv",  # Ensures compatibility across devices
            silent=True,
        )

        if not result or not isinstance(result, list) or "dominant_emotion" not in result[0]:
            raise HTTPException(status_code=400, detail="No face detected or invalid DeepFace response.")

        dominant_emotion = result[0]["dominant_emotion"]
        return {"emotion": dominant_emotion}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
