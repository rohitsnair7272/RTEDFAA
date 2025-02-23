import "./VoiceFeedback.css";
import React, { useState, useRef } from "react";

const VoiceFeedback = () => {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = () => {
    setRecording(true);
    setText(""); // Clear previous text

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);

          // Convert speech to text (Using Web Speech API)
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;

          recognition.onresult = (event) => {
            const speechText = event.results[0][0].transcript;
            setText(speechText);
            sendVoiceFeedbackToDB(speechText); // ✅ Send to MongoDB
          };

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
          };

          recognition.start();
        };

        mediaRecorderRef.current.start();
      })
      .catch((error) => console.error("Error accessing microphone:", error));
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  // ✅ Send Voice Feedback to MongoDB
  const sendVoiceFeedbackToDB = async (speechText) => {
    if (!speechText.trim()) {
      console.error("⚠️ No voice feedback detected.");
      return;
    }

    try {
      console.log("📢 Sending voice feedback to API...");

      const response = await fetch("http://127.0.0.1:8080/submit_voice_feedback", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: speechText }),
      });

      const data = await response.json();
      console.log("📢 API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit voice feedback");
      }

      console.log("✅ Voice feedback stored successfully!");
    } catch (error) {
      console.error("❌ Error submitting voice feedback:", error.message);
    }
  };

  return (
    <div className="voice-feedback">
      <h1 className="voice-heading">Voice Feedback</h1>

      <div className={`mic-button ${recording ? "recording" : ""}`} onClick={recording ? stopRecording : startRecording}>
        🎤
      </div>

      {recording && (
        <div className="waveform">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      )}

      {audioUrl && (
        <audio controls>
          <source src={audioUrl} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      )}

      <textarea
        className="text-box"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your speech will appear here..."
      />
    </div>
  );
};

export default VoiceFeedback;
