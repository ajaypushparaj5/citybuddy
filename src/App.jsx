import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import DigitalTwin from './pages/DigitalTwin';
import Traffic from './pages/Traffic';
import Navbar from './components/Navbar';
import './index.css';
import Home from './pages/Home';

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-hidden">
      {showNav && <Navbar />}
      <div className="flex-1 relative h-full w-full overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/twin" element={<DigitalTwin />} />
          <Route path="/traffic" element={<Traffic />} />
        </Routes>
      </div>
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
