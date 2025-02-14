import React from "react";
import './App.css';
//import Navbar from "./components/navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FeedbackSelector from "./components/FeedbackSelector";
import Nav from "./components/nav";
import EmotionFeedback from "./components/EmotionFeedback";


function App() {
  return (
    <Router>
    <div>
    <Nav/>
    <Routes>
    <Route path="/" element={<FeedbackSelector/>}/>
    <Route path="/emotion" element={<EmotionFeedback/>}/>
    </Routes>

    </div>
    </Router>
  );
}

export default App;
