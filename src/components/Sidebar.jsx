import React, { useState } from 'react';
import ActionPlanModal from './ActionPlanModal';
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
    setAreaParams,
    agentStates = [],
    elevationSamples = null,
    onRunScenario,
    onResetArea,
}) => {
    const [cityName, setCityName] = useState('New York, NY');
    const [activeAgentTab, setActiveAgentTab] = useState(null);
    const [selectedAlertForPlan, setSelectedAlertForPlan] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cityName.trim() && !isLoading) {
            onSubmit(cityName);
        }
    };

    return (
        <>
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
                                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af', margin: 0 }}>📍 Area Simulation (Advanced)</h2>
                                <button
                                    onClick={onResetArea}
                                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                                >Reset All</button>
                            </div>

                            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                {/* WEATHER */}
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '0.4rem' }}>
                                    <h3 style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>☀️ Weather & Environment</h3>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Rainfall <span>{(areaParams.rainfall * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.05" value={areaParams.rainfall} onChange={(e) => setAreaParams({ ...areaParams, rainfall: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#3b82f6', height: '4px' }} />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Wind Speed <span>{areaParams.windSpeed} km/h</span>
                                        </label>
                                        <input type="range" min="0" max="150" step="5" value={areaParams.windSpeed} onChange={(e) => setAreaParams({ ...areaParams, windSpeed: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#3b82f6', height: '4px' }} />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Temperature <span>{areaParams.temperature}°C</span>
                                        </label>
                                        <input type="range" min="-20" max="50" step="1" value={areaParams.temperature} onChange={(e) => setAreaParams({ ...areaParams, temperature: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#3b82f6', height: '4px' }} />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Earthquake Intensity <span>{areaParams.earthquake.toFixed(1)} M</span>
                                        </label>
                                        <input type="range" min="0" max="9" step="0.5" value={areaParams.earthquake} onChange={(e) => setAreaParams({ ...areaParams, earthquake: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#3b82f6', height: '4px' }} />
                                    </div>
                                </div>

                                {/* TRANSPORT */}
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '0.4rem' }}>
                                    <h3 style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>🚦 Transport</h3>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Traffic Density <span>{(areaParams.trafficDensity * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.05" value={areaParams.trafficDensity} onChange={(e) => setAreaParams({ ...areaParams, trafficDensity: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#8b5cf6', height: '4px' }} />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#1e40af', fontWeight: 600 }}>Major Road Closure</span>
                                        <input type="checkbox" checked={areaParams.roadClosure} onChange={(e) => setAreaParams({ ...areaParams, roadClosure: e.target.checked })} style={{ accentColor: '#ef4444' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#1e40af', fontWeight: 600 }}>Transit Network Failure</span>
                                        <input type="checkbox" checked={areaParams.publicTransportFailure} onChange={(e) => setAreaParams({ ...areaParams, publicTransportFailure: e.target.checked })} style={{ accentColor: '#ef4444' }} />
                                    </div>
                                </div>

                                {/* INFRASTRUCTURE */}
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '0.4rem' }}>
                                    <h3 style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>⚡ Infrastructure</h3>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Power Grid Load <span>{areaParams.powerGridLoad}%</span>
                                        </label>
                                        <input type="range" min="0" max="150" step="10" value={areaParams.powerGridLoad} onChange={(e) => setAreaParams({ ...areaParams, powerGridLoad: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#f59e0b', height: '4px' }} />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#1e40af', fontWeight: 600 }}>Blackout / Power Outage</span>
                                        <input type="checkbox" checked={areaParams.powerOutage} onChange={(e) => setAreaParams({ ...areaParams, powerOutage: e.target.checked })} style={{ accentColor: '#0f172a' }} />
                                    </div>
                                </div>

                                {/* POPULATION & EVENTS */}
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '0.4rem' }}>
                                    <h3 style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>👥 Population & Events</h3>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1e40af', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Crowd Density <span>{(areaParams.crowdDensity * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.1" value={areaParams.crowdDensity} onChange={(e) => setAreaParams({ ...areaParams, crowdDensity: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#10b981', height: '4px' }} />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#1e40af', fontWeight: 600 }}>Major Public Event</span>
                                        <input type="checkbox" checked={areaParams.publicEvent} onChange={(e) => setAreaParams({ ...areaParams, publicEvent: e.target.checked })} style={{ accentColor: '#10b981' }} />
                                    </div>
                                </div>

                                {/* CRISIS SCENARIOS */}
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '0.4rem', borderLeft: '3px solid #ef4444' }}>
                                    <h3 style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>🔥 Crisis Scenarios</h3>

                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#991b1b', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Fire Risk Index <span>{(areaParams.fireRisk * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.1" value={areaParams.fireRisk} onChange={(e) => setAreaParams({ ...areaParams, fireRisk: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#ef4444', height: '4px' }} />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#991b1b', fontWeight: 600 }}>Chemical / Hazmat Spill</span>
                                        <input type="checkbox" checked={areaParams.chemicalSpill} onChange={(e) => setAreaParams({ ...areaParams, chemicalSpill: e.target.checked })} style={{ accentColor: '#84cc16' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#991b1b', fontWeight: 600 }}>Evacuation Ordered</span>
                                        <input type="checkbox" checked={areaParams.evacuationOrder} onChange={(e) => setAreaParams({ ...areaParams, evacuationOrder: e.target.checked })} style={{ accentColor: '#dc2626' }} />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onRunScenario}
                                style={{
                                    width: '100%',
                                    marginTop: '0.75rem',
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                Run Scenario
                            </button>

                            <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.75rem', fontStyle: 'italic', textAlign: 'center' }}>
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
                                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>🤖 Multi-Agent Swarm</span>
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>{agentStates.length} Active</span>
                                </h2>

                                {/* Agent Swarm Overview Dashboard */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {agentStates.map(agent => (
                                        <div
                                            key={agent.name}
                                            onClick={() => setActiveAgentTab(activeAgentTab === agent.name ? null : agent.name)}
                                            style={{
                                                background: activeAgentTab === agent.name ? 'var(--accent-blue-subtle)' : '#f8fafc',
                                                border: `1px solid ${activeAgentTab === agent.name ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name.replace('Agent', '')}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: agent.status === 'processing' ? '#3b82f6' : '#10b981',
                                                    animation: agent.status === 'processing' ? 'pulse 1s infinite' : 'none'
                                                }}></span>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{agent.status}</span>
                                            </div>
                                            {agent.alerts.length > 0 && (
                                                <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', fontSize: '0.5rem', minWidth: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{agent.alerts.length}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Individual Agent Deep Dive Dashboard */}
                                {activeAgentTab && (
                                    <div style={{ background: '#1e293b', borderRadius: '0.75rem', padding: '1rem', color: 'white', marginBottom: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}>
                                        {agentStates.filter(a => a.name === activeAgentTab).map(agent => (
                                            <div key={agent.name}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                    <div>
                                                        <h3 style={{ fontSize: '0.9rem', color: '#60a5fa', margin: 0 }}>{agent.name}</h3>
                                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '2px 0 0' }}>{agent.description}</p>
                                                    </div>
                                                    <button onClick={() => setActiveAgentTab(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px' }}>×</button>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.4rem', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>Ticks</div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{agent.metrics?.totalTicks || 0}</div>
                                                    </div>
                                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.4rem', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>AI Calls</div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{agent.metrics?.aiCalls || 0}</div>
                                                    </div>
                                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '0.4rem', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>Latency</div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{agent.metrics?.lastRunMs || 0}ms</div>
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent Alerts</div>
                                                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                                    {agent.alerts.length === 0 ? (
                                                        <div style={{ fontSize: '0.7rem', color: '#475569', textAlign: 'center', padding: '1rem' }}>No recent alerts</div>
                                                    ) : (
                                                        agent.alerts.map(alert => (
                                                            <div key={alert.id} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px', marginBottom: '4px', borderLeft: '2px solid #60a5fa' }}>
                                                                <div style={{ color: '#cbd5e1', marginBottom: '2px' }}>{alert.message}</div>
                                                                <div style={{ color: '#64748b', fontSize: '0.6rem' }}>{alert.timestamp} • {alert.severity}</div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                                    Global Event Feed
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
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>System-Wide Alert Ticker</div>
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
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: alert.severity === 'high' ? '#fca5a5' : '#93c5fd', textTransform: 'uppercase' }}>{alert.agent}</span>
                                                    <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{alert.timestamp}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#f1f5f9', lineHeight: 1.3, marginBottom: '0.4rem' }}>{alert.message}</div>
                                                {/* Action Plan button — only for crisis-type alerts */}
                                                {(alert.type === 'flood_warning' || alert.type === 'flood' || alert.type === 'accident' || alert.type === 'emergency_dispatch') && (
                                                    <button
                                                        onClick={() => setSelectedAlertForPlan(alert)}
                                                        style={{
                                                            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.3rem',
                                                            padding: '3px 10px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            letterSpacing: '0.03em',
                                                        }}
                                                    >
                                                        🏛 Action Plan
                                                    </button>
                                                )}
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
            {selectedAlertForPlan && (
                <ActionPlanModal
                    alert={selectedAlertForPlan}
                    cityData={cityData}
                    sensorData={sensorData}
                    elevationSamples={elevationSamples}
                    onClose={() => setSelectedAlertForPlan(null)}
                />
            )}
        </>
    );
};

export default Sidebar;
