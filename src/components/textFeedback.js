import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./textFeedback.css";

const TextFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (feedback.trim() === "") {
      setError("⚠️ Please provide your feedback before submitting.");
      return;
    }

    console.log("Customer Feedback:", feedback);
    setSubmitted(true);
    setError(""); 
    setFeedback(""); 

    // Navigate back after 2 seconds
    setTimeout(() => {
      navigate("/");
    }, 2000);
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
