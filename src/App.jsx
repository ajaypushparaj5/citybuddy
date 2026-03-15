import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DigitalTwin from './pages/DigitalTwin';
import Traffic from './pages/Traffic';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Navbar />
        <div className="flex-1 relative">
          <Routes>
            <Route path="/" element={<DigitalTwin />} />
            <Route path="/traffic" element={<Traffic />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
