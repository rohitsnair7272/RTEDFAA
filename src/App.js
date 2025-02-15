import React from "react";
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FeedbackSelector from "./components/FeedbackSelector";
import Nav from "./components/nav";
import EmotionFeedback from "./components/EmotionFeedback";
import TextFeedback from "./components/textFeedback";
import VoiceFeedback from "./components/VoiceFeedback";

function App() {
  return (
    <Router>
    <div>
    <Nav/>
    <Routes>
    <Route path="/" element={<FeedbackSelector/>}/>
    <Route path="/emotion" element={<EmotionFeedback/>}/>
    <Route path="/text" element={<TextFeedback/>}/>
    <Route path="/voice" element={<VoiceFeedback/>}/>
    </Routes>

    </div>
    </Router>
  );
}

export default App;
