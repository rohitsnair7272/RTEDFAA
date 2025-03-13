from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime
from gemini import get_ai_suggestion  # ✅ Import AI function

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
db = client["FeedbackDB"]  # Database: FeedbackDB

# ✅ Create a single collection for all feedback types
feedback_collection = db["feedbacks"]  # Unified collection for all feedback types


# ✅ API to Receive Feedback and Get AI Suggestions
@app.post("/get_ai_suggestion")
async def get_ai_response(feedback: str = Form(...)):
    ai_suggestion = get_ai_suggestion(feedback)  # ✅ Calls AI function from gemini.py
    return {"suggestion": ai_suggestion}


# ✅ Store Text Feedback with AI Suggestions
@app.post("/submit_text_feedback")
async def submit_text_feedback(feedback: str = Form(...)):
    ai_suggestion = get_ai_suggestion(feedback)  # ✅ Get AI suggestion

    feedback_data = {
        "type": "text",
        "content": feedback,
        "Suggestion": ai_suggestion,  # ✅ Store AI suggestion
        "timestamp": datetime.utcnow()
    }

    result = feedback_collection.insert_one(feedback_data)
    print(f"✅ Text feedback stored with ID: {result.inserted_id}")

    return {"message": "Text feedback saved successfully", "ai_suggestion": ai_suggestion}


# ✅ Store Voice Feedback (Converted to Text) with AI Suggestions
@app.post("/submit_voice_feedback")
async def submit_voice_feedback(text: str = Form(...)):
    ai_suggestion = get_ai_suggestion(text)  # ✅ Get AI suggestion

    feedback_data = {
        "type": "voice",
        "content": text,
        "Suggestion": ai_suggestion,  # ✅ Store AI suggestion
        "timestamp": datetime.utcnow()
    }

    result = feedback_collection.insert_one(feedback_data)
    print(f"✅ Voice feedback stored with ID: {result.inserted_id}")

    return {"message": "Voice feedback saved successfully", "ai_suggestion": ai_suggestion}


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
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)