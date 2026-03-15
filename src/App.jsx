import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DigitalTwin from './pages/DigitalTwin';
import CitizenDashboard from './pages/CitizenDashboard';
import Navbar from './components/Navbar';
import Traffic from './pages/Traffic';
import './index.css';

import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-bg-primary">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/twin" element={<DigitalTwin />} />
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/traffic" element={<Traffic />} />
      </Routes>
    </div>
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

