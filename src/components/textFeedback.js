import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./textFeedback.css";

const TextFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (feedback.trim() === "") {
      alert("Please provide your feedback before submitting.");
      return;
    }

    console.log("Customer Feedback:", feedback);
    alert("Thank you for your feedback!");
    setFeedback(""); // Clear input after submission
    navigate("/"); // Navigate back
  };

  return (
    <div className="feedback-page">
      <h2 className="feedback-heading">Provide Your Feedback</h2>
      <div className="text-container">
        <textarea
          className="feedback-input"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Type your feedback here..."
        />
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      
    </div>
  );
};

export default TextFeedback;
