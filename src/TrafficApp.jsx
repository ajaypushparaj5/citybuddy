import React, { useState } from 'react';
import TrafficVideo from './components/TrafficVideo';
import './index.css';

function TrafficApp() {
    const [trafficStats, setTrafficStats] = useState({
        vehicleCount: 0,
        congestionLevel: '-',
        incidentPayload: null,
        recommendationPayload: null
    });

    return (
        <div className="app-container">
            <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                    <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Traffic AI Tracking</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
                        Upload your traffic camera footage on the right to asynchronously process it through the Python YOLO model.
                    </p>

                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>Live Tracking Analysis</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="status-card" style={{
                            backgroundColor: trafficStats.congestionLevel === 'HIGH' ? '#fee2e2' : trafficStats.congestionLevel === 'MODERATE' ? '#fef3c7' : trafficStats.congestionLevel === 'LOW' ? '#dcfce7' : '#f1f5f9',
                            border: '1px solid',
                            borderColor: trafficStats.congestionLevel === 'HIGH' ? '#fecaca' : trafficStats.congestionLevel === 'MODERATE' ? '#fde68a' : trafficStats.congestionLevel === 'LOW' ? '#bbf7d0' : '#e2e8f0',
                        }}>
                            <h3 style={{ color: trafficStats.congestionLevel === 'HIGH' ? '#991b1b' : trafficStats.congestionLevel === 'MODERATE' ? '#92400e' : trafficStats.congestionLevel === 'LOW' ? '#166534' : 'var(--text-secondary)' }}>Live Congestion</h3>
                            <div className="status-value" style={{
                                color: trafficStats.congestionLevel === 'HIGH' ? '#991b1b' : trafficStats.congestionLevel === 'MODERATE' ? '#92400e' : trafficStats.congestionLevel === 'LOW' ? '#166534' : 'var(--text-primary)',
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

                    <h2 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>AI Response Agent</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                        {trafficStats.incidentPayload ? (
                            <>
                                <div style={{ backgroundColor: '#1e293b', color: '#38bdf8', padding: '15px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto' }}>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event Output</h4>
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(trafficStats.incidentPayload, null, 2)}
                                    </pre>
                                </div>

                                <div style={{ backgroundColor: '#1e293b', color: '#4ade80', padding: '15px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto', marginTop: '10px' }}>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Decision Matrix Output</h4>
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(trafficStats.recommendationPayload, null, 2)}
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <div className="status-card" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                                <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 500 }}>
                                    System is operating normally. Traffic flow is within acceptable margins.
                                </div>
                            </div>
                        )}
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
