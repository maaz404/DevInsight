import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnalyzeRepo from './pages/AnalyzeRepo';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* DevInsight - AI-Powered Repository Analyzer */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<AnalyzeRepo />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
