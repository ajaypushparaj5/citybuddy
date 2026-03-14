import React, { useState } from 'react';

const Sidebar = ({ onSubmit, isLoading, error, cityData, showElevation, setShowElevation, showBuildings, setShowBuildings }) => {
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
                    <div style={{ marginTop: '2rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>Twin Status</h2>
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
                )}
            </div>
        </div>
    );
};

export default Sidebar;
