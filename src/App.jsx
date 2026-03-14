import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DigitalTwin from './pages/DigitalTwin';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/twin" element={<DigitalTwin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

