import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import App from './App';
import TrafficApp from './TrafficApp';
import './index.css';

function MainRouter() {
    return (
        <BrowserRouter>
            {/* Global Navigation Bar */}
            <nav style={{
                display: 'flex',
                gap: '20px',
                padding: '15px 30px',
                backgroundColor: '#0f172a',
                color: 'white',
                borderBottom: '1px solid #334155'
            }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', marginRight: '20px' }}>
                    CITYBUDDY AI
                </div>
                <Link to="/" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 500 }}>
                    Digital Twin Engine
                </Link>
                <Link to="/traffic" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 500 }}>
                    Traffic Tracking AI
                </Link>
            </nav>

            {/* Page Content */}
            <div style={{ height: 'calc(100vh - 60px)' }}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/traffic" element={<TrafficApp />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default MainRouter;
