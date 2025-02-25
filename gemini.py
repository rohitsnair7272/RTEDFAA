import requests
import os
from dotenv import load_dotenv

# ✅ Load API key from .env file
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_ai_suggestion(feedback_text):
    """
    Sends customer feedback to Google Gemini AI and returns improvement suggestions.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "contents": [
            {
                "parts": [{"text": feedback_text}]
            }
        ]
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        response_data = response.json()

        if "candidates" in response_data:
            return response_data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            return "AI did not return a valid response."

    except Exception as e:
        print(f"❌ AI Suggestion Error: {e}")
        return "AI could not generate suggestions."

# ✅ Test AI separately (optional)
if __name__ == "__main__":
    feedback = "The service is proper"
    suggestion = get_ai_suggestion(feedback)
    print("📢 AI Suggestion:", suggestion)
