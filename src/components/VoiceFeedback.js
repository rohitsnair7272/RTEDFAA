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
            setText(event.results[0][0].transcript);
          };

          recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
          };

          const audioFile = new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" });
          const audioURL = URL.createObjectURL(audioFile);
          const audioElement = new Audio(audioURL);
          audioElement.play();

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

  return (
    <div className="voice-feedback">
     
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
