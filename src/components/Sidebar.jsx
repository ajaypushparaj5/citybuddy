import React, { useState } from 'react';

const Sidebar = ({ 
    onSubmit, 
    isLoading, 
    error, 
    cityData, 
    showElevation, 
    setShowElevation, 
    showBuildings, 
    setShowBuildings,
    activeAlerts = [],
    sensorData = null,
    selectedArea = null,
    areaParams = { rainfall: 0, trafficDensity: 0 },
    setAreaParams
}) => {
    const [cityName, setCityName] = useState('New York, NY');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cityName.trim() && !isLoading) {
            onSubmit(cityName);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-boxes"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg>
                    AI-CityEngine
                </h1>
            </div>

            <div className="sidebar-content">
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label" htmlFor="city-input">Select Region / City</label>
                        <input
                            id="city-input"
                            className="input"
                            type="text"
                            placeholder="e.g. San Francisco, CA"
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        disabled={isLoading || !cityName.trim()}
                    >
                        {isLoading ? 'Generating Twin...' : 'Generate Digital Twin'}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: '1rem', color: 'var(--accent-red)', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {selectedArea && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.6rem', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af', margin: 0 }}>📍 Area Simulation</h2>
                            <button 
                                onClick={() => { setAreaParams({ rainfall: 0, trafficDensity: 0 }); /* parent handles closing via state logic or we just let it be */ }}
                                style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer' }}
                            >Reset</button>
                        </div>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Local Rainfall <span>{(areaParams.rainfall * 100).toFixed(0)}%</span>
                            </label>
                            <input 
                                type="range" min="0" max="1" step="0.05" 
                                value={areaParams.rainfall} 
                                onChange={(e) => setAreaParams({...areaParams, rainfall: parseFloat(e.target.value)})}
                                style={{ width: '100%', accentColor: '#3b82f6', height: '4px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                Local Traffic Density <span>{(areaParams.trafficDensity * 100).toFixed(0)}%</span>
                            </label>
                            <input 
                                type="range" min="0" max="1" step="0.05" 
                                value={areaParams.trafficDensity} 
                                onChange={(e) => setAreaParams({...areaParams, trafficDensity: parseFloat(e.target.value)})}
                                style={{ width: '100%', accentColor: '#3b82f6', height: '4px' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            *Right-click map to move selection.
                        </p>
                    </div>
                )}

                {cityData && (
                    <div style={{ marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                <input
                                    type="checkbox"
                                    checked={showElevation}
                                    onChange={(e) => setShowElevation(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }}
                                />
                                Show Terrain Elevation Map
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                <input
                                    type="checkbox"
                                    checked={showBuildings}
                                    onChange={(e) => setShowBuildings(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }}
                                />
                                Show Buildings Footprints
                            </label>
                        </div>
                    </div>
                )}

                {cityData && (
                    <>
                        <div style={{ marginTop: '2rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                                Live Monitoring
                            </h2>
                            
                            {sensorData && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div className="status-card" style={{ background: '#f8fafc' }}>
                                        <h3>Weather</h3>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sensorData.weather.temp.toFixed(1)}°C</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{sensorData.weather.condition}</div>
                                    </div>
                                    <div className="status-card" style={{ background: '#f8fafc' }}>
                                        <h3>Traffic</h3>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sensorData.traffic.length} active</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>congested nodes</div>
                                    </div>
                                </div>
                            )}

                            <div style={{ 
                                background: '#0f172a', 
                                borderRadius: '0.5rem', 
                                padding: '0.75rem', 
                                minHeight: '150px', 
                                maxHeight: '300px', 
                                overflowY: 'auto',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Agent Alert Ticker</div>
                                {activeAlerts.length === 0 ? (
                                    <div style={{ color: '#475569', fontSize: '0.75rem', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Scanning city data...</div>
                                ) : (
                                    activeAlerts.map(alert => (
                                        <div key={alert.id} style={{ 
                                            marginBottom: '0.5rem', 
                                            padding: '0.5rem', 
                                            borderRadius: '0.3rem', 
                                            background: alert.severity === 'high' ? '#450a0a' : '#1e293b',
                                            borderLeft: `3px solid ${alert.severity === 'high' ? '#ef4444' : '#3b82f6'}`,
                                            animation: 'slideIn 0.3s ease-out'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: alert.severity === 'high' ? '#fca5a5' : '#93c5fd', textTransform: 'uppercase' }}>{alert.type}</span>
                                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{alert.timestamp}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#f1f5f9', lineHeight: 1.3 }}>{alert.message}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>Infrastructure Stats</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div className="status-card">
                                    <h3>Nodes</h3>
                                    <div className="status-value">{cityData.nodes?.length || 0}</div>
                                </div>
                                <div className="status-card">
                                    <h3>Edges</h3>
                                    <div className="status-value">{cityData.edges?.length || 0}</div>
                                </div>
                                <div className="status-card">
                                    <h3>Hospitals</h3>
                                    <div className="status-value">{cityData.infrastructure?.hospitals || 0}</div>
                                </div>
                                <div className="status-card">
                                    <h3>Police / Fire</h3>
                                    <div className="status-value">{cityData.infrastructure?.emergency || 0}</div>
                                </div>
                            </div>

                            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Center: {cityData.center[1].toFixed(4)}, {cityData.center[0].toFixed(4)}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
