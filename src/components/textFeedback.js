import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./textFeedback.css";

const TextFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState(""); // State for category
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (category === "") {
      setError("⚠️ Please select a feedback category.");
      return;
    }

    if (feedback.trim() === "") {
      setError("⚠️ Please provide your feedback before submitting.");
      return;
    }

    console.log("Category:", category);
    console.log("Customer Feedback:", feedback);
    setSubmitted(true);
    setError(""); 
    setFeedback(""); 
    setCategory(""); 

    // Navigate back after 2 seconds
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="page-container">
    <div className="feedback-page">
      <h2 className="feedback-heading">Provide Your Feedback</h2>
      <div className="feedback-category-container">
      <label className="feedback-category-label">Feedback Category</label>
      <select className="feedback-category" value={category} 
              onChange={(e) => {
                setCategory(e.target.value);
                setError(""); 
              }}
            > 
              <option value="">--Please Select--</option>
              <option value="Question">Question</option>
              <option value="Problem">Problem</option>
              <option value="Appreciation">Appreciation</option>
              <option value="Request">Request</option>
              <option value="Other">Other</option>
            </select>
            </div>
      <div className="text-container">
        {!submitted ? (
          <>
            {error && <p className="error-message">{error}</p>} 

            <label className="message">Message</label>
            {/* Feedback Input */}
            <textarea className="feedback-input" value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError(""); 
              }}
              placeholder="Type your feedback here..."/>

            
          </>
        ) : (
          <p className="success-message">✅ Thank you for your feedback!</p>
        )}
      </div>
      {/* Submit Button */}
      <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>
    </div>
  );
};

export default TextFeedback;
