import React, { useState } from 'react';
import TrafficVideo from '../components/TrafficVideo';

function Traffic() {
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
                    <h2 className="text-xl font-bold mb-4 text-text-primary">Traffic Statistics</h2>
                    
                    <div className="status-card h-auto m-0 mb-4">
                        <h3>Live Congestion</h3>
                        <div className="status-value" style={{ 
                            color: trafficStats.congestionLevel === 'HIGH' ? 'var(--color-accent-red)' : 
                                   trafficStats.congestionLevel === 'MODERATE' ? 'var(--color-accent-orange)' : 
                                   trafficStats.congestionLevel === 'LOW' ? 'var(--color-accent-teal)' : 'var(--color-text-primary)'
                        }}>
                            {trafficStats.congestionLevel}
                        </div>
                    </div>

                    <div className="status-card h-auto m-0 mb-4">
                        <h3>Vehicles Detected</h3>
                        <div className="status-value">{trafficStats.vehicleCount}</div>
                    </div>

                    <div className="mt-8 p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                        <h4 className="text-sm font-bold text-accent-blue mb-2 uppercase">AI Insight</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {trafficStats.vehicleCount > 7 ? 
                                'Heavy congestion detected. High priority alert dispatched.' : 
                                'Traffic flow is within normal parameters for this sector.'}
                        </p>
                    </div>

                    {trafficStats.incidentPayload && (
                        <div className="mt-6">
                            <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">Decision Matrix</h3>
                            <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-[10px] overflow-x-auto shadow-inner">
                                <pre className="m-0">
                                    {JSON.stringify(trafficStats.recommendationPayload, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="map-container">
                <TrafficVideo onStatsUpdate={setTrafficStats} />
            </div>
        </div>
    );
}

export default Traffic;
