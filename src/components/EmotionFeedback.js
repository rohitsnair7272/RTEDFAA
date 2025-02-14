import React, { useRef, useState } from "react";
import axios from "axios";

const EmotionFeedback = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState(null);
  const [captured, setCaptured] = useState(false);

  // Start Webcam
  const startWebcam = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  // Capture Image
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setCaptured(true);
    sendToBackend(canvas);
  };

  // Send Image to Backend for Emotion Detection
  const sendToBackend = async (canvas) => {
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "captured.jpg");

      try {
        const response = await axios.post("http://127.0.0.1:5000/detect_emotion", formData);
        setEmotion(response.data.emotion);
      } catch (error) {
        console.error("Error detecting emotion:", error);
      }
    }, "image/jpeg");
  };

  return (
    <div className="emotion-container">
      <h2>Emotion Feedback</h2>
      <video ref={videoRef} autoPlay></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {!captured ? (
        <button onClick={captureImage}>Capture</button>
      ) : (
        <h3>Detected Emotion: {emotion ? emotion : "Detecting..."}</h3>
      )}

      <button onClick={startWebcam}>Start Webcam</button>
    </div>
  );
};

export default EmotionFeedback;
