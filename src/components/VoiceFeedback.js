import "./VoiceFeedback.css";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate for navigation

const VoiceFeedback = () => {
  const [recording, setRecording] = useState(false);
  const [text, setText] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState(""); 
  const [audioUrl, setAudioUrl] = useState(null);
  const [submitted, setSubmitted] = useState(false); // ✅ State to track submission

  const navigate = useNavigate(); // ✅ Navigation hook
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null); // Store speech recognition instance

  // Function to start speech recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please try Chrome.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true; // Capture words as they are spoken

    recognitionRef.current.onresult = (event) => {
      let speechText = "";
      for (let i = 0; i < event.results.length; i++) {
        speechText += event.results[i][0].transcript + " ";
      }
      setText(speechText.trim());
    };

    recognitionRef.current.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
    };

    recognitionRef.current.start();
  };

  // Start recording & speech recognition
  const startRecording = () => {
    setRecording(true);
    setText(""); // Clear previous text
    startSpeechRecognition(); // Start real-time voice-to-text

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
        };

        mediaRecorderRef.current.start();
      })
      .catch((error) => console.error("Error accessing microphone:", error));
  };

  // Stop recording & speech recognition
  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Send feedback to API
  const handleSubmit = async () => {
    if (!text.trim()) {
      console.error("⚠️ No valid text to submit.");
      return;
    }

    try {
      console.log("📢 Sending voice feedback to API...");
      const response = await fetch("http://127.0.0.1:8080/submit_voice_feedback", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit feedback");
      setAiSuggestion(data.ai_suggestion);

      // ✅ Show Thank You Message
      setSubmitted(true);
      
      // ✅ Navigate to Feedback Selector after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

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

      {!submitted ? (
        <button onClick={handleSubmit}>Submit Feedback</button> 
        
      ) : (
        <p className="success-message">✅ Thank you for your response!</p>
      )}
    </div>
  );
};

export default VoiceFeedback;
