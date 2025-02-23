import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./textFeedback.css";

const TextFeedback = () => {
  const [feedback, setFeedback] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (feedback.trim() === "") {
      setError("⚠️ Please provide your feedback before submitting.");
      return;
    }
  
    try {
      console.log("📢 Sending feedback to API...");
  
      const response = await fetch("http://127.0.0.1:8080/submit_text_feedback", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ feedback }),
      });
  
      console.log("📢 API Response:", response);
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }
  
      setSubmitted(true);
      setError(""); 
      setFeedback(""); 
  
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("❌ Error submitting feedback:", error.message);
      setError(`❌ ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="feedback-page">
        <h2 className="feedback-heading">Provide Your Feedback</h2>
        <div className="text-container">
          {!submitted ? (
            <>
              {error && <p className="error-message">{error}</p>} 
              <label className="message">Message</label>
              <textarea 
                className="feedback-input" 
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  setError(""); 
                }}
                placeholder="Type your feedback here..."
              />
            </>
          ) : (
            <p className="success-message">✅ Thank you for your feedback!</p>
          )}
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default TextFeedback;