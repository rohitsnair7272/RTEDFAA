from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime

app = FastAPI()

# ✅ Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Connect to MongoDB
MONGO_URI = "mongodb://127.0.0.1:27017"
client = MongoClient(MONGO_URI)
db = client["FeedbackDB"]  # Database: feedbackDB

# ✅ Create a single collection for all feedback types
feedback_collection = db["feedbacks"]  # One collection for all feedback

# ✅ Store Text Feedback
@app.post("/submit_text_feedback")
async def submit_text_feedback(feedback: str = Form(...)):
    feedback_data = {
        "type": "text",
        "content": feedback,
        "timestamp": datetime.utcnow()
    }
    result = feedback_collection.insert_one(feedback_data)
    print(f"✅ Text feedback stored with ID: {result.inserted_id}")
    return {"message": "Text feedback saved successfully"}

# ✅ Store Voice Feedback (Converted to Text)
@app.post("/submit_voice_feedback")
async def submit_voice_feedback(text: str = Form(...)):
    feedback_data = {
        "type": "voice",
        "content": text,
        "timestamp": datetime.utcnow()
    }
    result = feedback_collection.insert_one(feedback_data)
    print(f"✅ Voice feedback stored with ID: {result.inserted_id}")
    return {"message": "Voice feedback saved successfully"}

# ✅ Store Emotion Feedback (Emotion & Rating)
@app.post("/submit_emotion_feedback")
async def submit_emotion_feedback(emotion: str = Form(...), rating: int = Form(...)):
    feedback_data = {
        "type": "emotion",
        "emotion": emotion,
        "rating": rating,
        "timestamp": datetime.utcnow()
    }
    result = feedback_collection.insert_one(feedback_data)
    print(f"✅ Emotion feedback stored with ID: {result.inserted_id}")
    return {"message": "Emotion feedback saved successfully"}

# ✅ Start FastAPI Server
if _name_ == "_main_":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)