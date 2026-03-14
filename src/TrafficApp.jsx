import React, { useState } from 'react';
import TrafficVideo from './components/TrafficVideo';
import './index.css';

function TrafficApp() {
    const [trafficStats, setTrafficStats] = useState({ vehicleCount: 0, congestionLevel: '-' });

    return (
        <div className="app-container">
            <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                    <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Traffic AI Tracking</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
                        Upload your traffic camera footage on the right to asynchronously process it through the Python YOLO model.
                    </p>

                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>Live Tracking Analysis</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="status-card" style={{
                            backgroundColor: trafficStats.congestionLevel === 'High' ? '#fee2e2' : trafficStats.congestionLevel === 'Moderate' ? '#fef3c7' : trafficStats.congestionLevel === 'Low' ? '#dcfce7' : '#f1f5f9',
                            border: '1px solid',
                            borderColor: trafficStats.congestionLevel === 'High' ? '#fecaca' : trafficStats.congestionLevel === 'Moderate' ? '#fde68a' : trafficStats.congestionLevel === 'Low' ? '#bbf7d0' : '#e2e8f0',
                        }}>
                            <h3 style={{ color: trafficStats.congestionLevel === 'High' ? '#991b1b' : trafficStats.congestionLevel === 'Moderate' ? '#92400e' : trafficStats.congestionLevel === 'Low' ? '#166534' : 'var(--text-secondary)' }}>Live Congestion</h3>
                            <div className="status-value" style={{
                                color: trafficStats.congestionLevel === 'High' ? '#991b1b' : trafficStats.congestionLevel === 'Moderate' ? '#92400e' : trafficStats.congestionLevel === 'Low' ? '#166534' : 'var(--text-primary)',
                                fontSize: '1.25rem'
                            }}>
                                {trafficStats.congestionLevel}
                            </div>
                        </div>

                        <div className="status-card">
                            <h3>Vehicles Detected</h3>
                            <div className="status-value">{trafficStats.vehicleCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="map-container">
                <TrafficVideo onStatsUpdate={setTrafficStats} />
            </div>
        </div>
    );
}

export default TrafficApp;
