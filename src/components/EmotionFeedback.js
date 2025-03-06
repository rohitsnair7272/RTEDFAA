import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "./EmotionFeedback.css";

const EmotionFeedback = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsWebcamActive(true);
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  }, []);

  const startCaptureCountdown = () => {
    setCountdown(5);
    let timeLeft = 5;

    const interval = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(interval);
        captureImage();
      }
    }, 1000);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(true);
    setCountdown(null);
    sendToBackend(canvas);
  };

  const sendToBackend = async (canvas) => {
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "captured.jpg");

      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/detect_emotion",
          formData
        );
        const detectedEmotion = response.data.emotion;
        setEmotion(detectedEmotion);
        sendEmotionFeedbackToDB(detectedEmotion); // ✅ Send to MongoDB
      } catch (error) {
        console.error("Error detecting emotion:", error);
        setEmotion("Error detecting emotion");
      }
    }, "image/jpeg");
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      let stream = videoRef.current.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  // ⭐ Function to get star rating based on emotion
  const getStarRating = (emotion) => {
    const ratings = {
      angry: 1,
      disgust: 1,
      fear: 2,
      sad: 2,
      neutral: 3,
      surprise: 4,
      happy: 5,
    };
    return ratings[emotion] || 0; // Default to 0 if emotion is not recognized
  };

  // ✅ Send Emotion Feedback to MongoDB
  const sendEmotionFeedbackToDB = async (detectedEmotion) => {
    if (!detectedEmotion) {
      console.error("⚠️ No emotion detected.");
      return;
    }

    const rating = getStarRating(detectedEmotion); // Get rating based on emotion

    try {
      console.log("📢 Sending emotion feedback to API...");

      const response = await fetch("http://127.0.0.1:8080/submit_emotion_feedback", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ emotion: detectedEmotion, rating: rating.toString() }),
      });

      const data = await response.json();
      console.log("📢 API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit emotion feedback");
      }

      setTimeout(() => {
        navigate("/");
      }, 2000);

      console.log("✅ Emotion feedback stored successfully!");
    } catch (error) {
      console.error("❌ Error submitting emotion feedback:", error.message);
    }
  };

  return (
    <div className="emotion-container">
      <h2>Emotion Feedback</h2>
      <video ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {countdown !== null ? (
        <h3 className="countdown">{countdown}</h3>
      ) : !captured ? (
        <button onClick={startCaptureCountdown}>Capture</button>
      ) : (
        <>
          <h3>Detected Emotion: {emotion ? emotion : "Detecting..."}</h3>
          <div className="stars">
            {Array.from({ length: getStarRating(emotion) }, (_, i) => (
              <span key={i} className="star">⭐</span>
            ))}
          </div>
        </>
      )}

      {isWebcamActive && <button onClick={stopWebcam}>Stop Webcam</button>}
    </div>
  );
};

export default EmotionFeedback;
