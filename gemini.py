import requests
import os
from dotenv import load_dotenv

# ✅ Load API key from .env file
load_dotenv()
GEMINI_API_KEY = os.getenv("REACT_APP_GEMINI_API_KEY")

def get_ai_suggestion(feedback_text):
    """
    Sends customer feedback to Google Gemini AI and returns actionable suggestions for shop owners.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

    headers = {
        "Content-Type": "application/json"
    }

    # ✅ Improved prompt for shop owners
    prompt = f"""
    You are an expert business consultant helping a shop owner improve their services. 
    You are an AI called 'RAL', and your task is to help improve the shopping experience.
                      Your primary role is to collect feedback from customers and provide suggestions to the shopkeeper
                      for making the user experience better. You will answer customer questions based on the provided knowledge 
                      about the shop and assist the shopkeeper with actionable insights from customer feedback.
    A customer has provided the following feedback: "{feedback_text}".
    
    Based on this feedback, suggest a clear and **practical improvement** the shop owner should make.
    Keep the response **short, pointwise, direct, and business-focused**.
    """

    data = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        response_data = response.json()

        # ✅ Extract and return the AI-generated suggestion
        if "candidates" in response_data:
            return response_data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            return "AI could not generate a valid suggestion."

    except Exception as e:
        print(f"❌ AI Suggestion Error: {e}")
        return "AI could not generate suggestions."

# ✅ Test AI separately
if __name__ == "__main__":
    feedback = "The shop is very crowded, and checkout takes too long."
    suggestion = get_ai_suggestion(feedback)
    print("📢 AI Suggestion for Shop Owner:", suggestion)
