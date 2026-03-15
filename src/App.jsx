import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DigitalTwin from './pages/DigitalTwin';
import CitizenDashboard from './pages/CitizenDashboard';
import Navbar from './components/Navbar';
import './index.css';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/twin" element={<DigitalTwin />} />
          <Route path="/citizen" element={<CitizenDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

