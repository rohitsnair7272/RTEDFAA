import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")

# ✅ Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["FeedbackDB"]
collection = db["feedbacks"]

# ✅ Streamlit App Configuration (Wide Layout)
st.set_page_config(page_title="Customer Feedback Dashboard", layout="wide")

# ✅ Fetch Data from MongoDB
feedback_data = list(collection.find({}, {"_id": 0}))
df = pd.DataFrame(feedback_data) if feedback_data else pd.DataFrame()

# ✅ Apply Custom CSS for Table Formatting & Layout
st.markdown(
    """
    <style>
        div[data-testid="stDataFrame"] { overflow: hidden !important; width: 100%; height: auto !important; }
        .st-emotion-cache-1r6slb0, .st-emotion-cache-16idsys { white-space: normal !important; word-wrap: break-word !important; }
        section.main { padding-top: 0rem; padding-bottom: 0rem; }
        .block-container { padding-top: 1rem; padding-bottom: 1rem; }
    </style>
    """,
    unsafe_allow_html=True
)

# ✅ Title
# ✅ Center Align, Adjust Font Size & Move Title Down
st.markdown(
    """
    <h2 style="text-align: center; font-size: 62px; padding-top: 40px;">📊 Customer Feedback Dashboard</h2>
    """,
    unsafe_allow_html=True
)


if not df.empty:
    # ✅ Metrics Section
    st.markdown("### 📌 Key Metrics")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric(label="Total Feedbacks", value=len(df))
    col2.metric(label="Text Feedbacks", value=len(df[df["type"] == "text"]))
    col3.metric(label="Voice Feedbacks", value=len(df[df["type"] == "voice"]))
    col4.metric(label="Emotion Feedbacks", value=len(df[df["type"] == "emotion"]))

    # ✅ Emotion Chart
    st.markdown(
    """
    <h2 style="font-size: 32px; font-style: italic">😊 Emotion Feedback Analysis</h2>
    """,
    unsafe_allow_html=True
)  
    col1, col2 = st.columns([2, 1])

    if "emotion" in df.columns:
        emotion_order = ["happy", "sad", "surprise", "neutral", "angry"]
        df["emotion"] = df["emotion"].fillna("Not Available")  # Fix NaN issue
        emotion_counts = df["emotion"].value_counts()
        emotion_counts = emotion_counts.reindex(emotion_order, fill_value=0) 

    # Emotion Chart (Smaller)
    fig, ax = plt.subplots(figsize=(1.5, 0.5))  
    sns.barplot(x=emotion_counts.index, y=emotion_counts.values, hue=emotion_counts.index, ax=ax, palette="coolwarm", legend=False)
    ax.tick_params(axis="x", labelsize=3)  
    ax.tick_params(axis="y", labelsize=3)
    ax.set_xlabel("-----> Emotion", fontsize=2)
    ax.set_ylabel("-----> Count", fontsize=2)
    ax.set_title("Emotion Distribution", fontsize=4)
    col1.pyplot(fig)

   # ✅ Feedback Distribution Pie Chart
    feedback_counts = df["type"].value_counts()

    fig, ax = plt.subplots(figsize=(1, 1))      

# Reduce font size for labels & percentages
    ax.pie(
        feedback_counts, 
        labels=feedback_counts.index, 
        autopct="%1.1f%%", 
        colors=sns.color_palette("pastel"),
        textprops={"fontsize": 3}  # ✅ Reduce font size here
    )

    col2.pyplot(fig)


    # ✅ Customer Feedback Table
    st.markdown(
    """
    <h2 style="font-size: 32px; font-style : italic;">📝 Customer Feedbacks</h2>
    """,
    unsafe_allow_html=True
    ) 
    
    # **Dropdown to Select Feedback Type**
    feedback_types = ["All"] + df["type"].unique().tolist()
    selected_feedback_type = st.selectbox("Select Feedback Type:", feedback_types, key="feedback_type")

    # **Filter Data Based on Selection**
    if selected_feedback_type != "All":
        filtered_feedback = df[df["type"] == selected_feedback_type]
    else:
        filtered_feedback = df

    # **Format Table**
    feedback_table = filtered_feedback.copy()
    feedback_table["rating"] = feedback_table["rating"].apply(lambda x: "⭐" * int(x) if pd.notna(x) else "N/A")

    # ✅ Show Emotion Column (Only for Emotion Feedbacks)
    if "emotion" in feedback_table.columns:
        feedback_table["emotion"] = feedback_table.apply(lambda row: row["emotion"] if row["type"] == "emotion" else "N/A", axis=1)
    else:
        feedback_table["emotion"] = "N/A"

    # ✅ Rename Columns
    feedback_table = feedback_table.rename(columns={"content": "Feedback", "type": "Type", "rating": "Rating", "emotion": "Emotion"})
    feedback_table = feedback_table[["Type", "Feedback", "Emotion", "Rating"]]  # Ensure proper order

    # **Display Table**
    st.dataframe(feedback_table, use_container_width=True)

    # ✅ AI Suggestions Table
    st.markdown(
    """
    <h2 style="font-size: 32px; font-style: italic">🤖 AI Suggestions</h2>
    """,
    unsafe_allow_html=True
    ) 
    
    
    # **Dropdown to Select AI Suggestion Type**
    suggestion_types = ["All"] + df[df["type"].isin(["text", "voice"])]["type"].unique().tolist()
    selected_suggestion_type = st.selectbox("Select AI Suggestion Type:", suggestion_types, key="ai_type")

    # **Filter AI Suggestions**
    ai_filtered = df[(df["type"].isin(["text", "voice"])) & df["Suggestion"].notna()]
    if selected_suggestion_type != "All":
        ai_filtered = ai_filtered[ai_filtered["type"] == selected_suggestion_type]

    # **Format Table**
    ai_table = ai_filtered.rename(columns={"content": "Feedback", "type": "Type", "Suggestion": "AI Suggestion"})
    ai_table = ai_table[["Type", "Feedback", "AI Suggestion"]]

    # **Display AI Suggestions with Expandable View**
    for idx, row in ai_table.iterrows():
        with st.expander(f"**{idx+1}. Type:** {row['Type'].capitalize()} - 💬 {row['Feedback']}"):
            st.success(f"🤖 {row['AI Suggestion']}")

else:
    st.warning("No feedback data found.")

# ✅ Run the dashboard using: `streamlit run dashboard.py`
