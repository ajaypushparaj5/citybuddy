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
    resourceBudget = { ambulances: 50, fireTrucks: 20, policeUnits: 100, medicalPersonnel: 200, helicopters: 2, volunteers: 500, cityBudgetMil: 5 },
    setResourceBudget,
    agentStates = [],
    elevationSamples = null,
    onRunScenario,
    onResetArea,
}) => {
    const [cityName, setCityName] = useState('New York, NY');
    const [activeAgentTab, setActiveAgentTab] = useState(null);
    const [selectedAlertForPlan, setSelectedAlertForPlan] = useState(null);

    const updateResource = (key, delta) => {
        if (!setResourceBudget) return;
        setResourceBudget(prev => ({
            ...prev,
            [key]: Math.max(0, prev[key] + delta)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cityName.trim() && !isLoading) {
            onSubmit(cityName);
        }
    };

    return (
        <>
            <div className="w-[400px] bg-bg-surface border-r border-border-subtle shadow-sm flex flex-col z-10 shrink-0 h-full">
                <div className="p-6 border-b border-border-subtle">
                    <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-boxes"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg>
                        AI-CityEngine
                    </h1>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-text-secondary" htmlFor="city-input">Select Region / City</label>
                            <input
                                id="city-input"
                                className="w-full px-4 py-3 border border-border-subtle rounded-lg text-sm bg-bg-surface transition-all duration-200 outline-hidden focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                                type="text"
                                placeholder="e.g. San Francisco, CA"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-accent-blue text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 disabled:bg-blue-200 disabled:cursor-not-allowed"
                            disabled={isLoading || !cityName.trim()}
                        >
                            {isLoading ? 'Generating Twin...' : 'Generate Digital Twin'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 text-accent-red text-[0.875rem] p-3 bg-red-50 rounded-lg border border-red-200 font-medium">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {selectedArea && (
                        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-[0.875rem] font-bold text-blue-800">📍 Area Simulation (Advanced)</h2>
                                <button
                                    onClick={onResetArea}
                                    className="bg-transparent border-none text-blue-400 text-[0.75rem] font-medium cursor-pointer px-2 py-1 hover:text-blue-600 transition-colors"
                                >Reset All</button>
                            </div>

                            <div className="max-h-[350px] overflow-y-auto pr-2 flex flex-col gap-4">

                                {/* WEATHER */}
                                <div className="bg-white/50 p-2 rounded-lg border border-blue-100/50 shadow-xs">
                                    <h3 className="text-[0.75rem] text-slate-600 mb-2 flex items-center gap-1 font-semibold italic">☀️ Weather & Environment</h3>

                                    <div className="mb-2">
                                        <label className="flex justify-between text-[0.65rem] text-blue-900 font-bold mb-1">
                                            Rainfall <span>{(areaParams.rainfall * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.05" value={areaParams.rainfall} onChange={(e) => setAreaParams({ ...areaParams, rainfall: parseFloat(e.target.value) })} className="w-full accent-blue-600 h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="mb-2">
                                        <label className="flex justify-between text-[0.65rem] text-blue-900 font-bold mb-1">
                                            Wind Speed <span>{areaParams.windSpeed} km/h</span>
                                        </label>
                                        <input type="range" min="0" max="150" step="5" value={areaParams.windSpeed} onChange={(e) => setAreaParams({ ...areaParams, windSpeed: parseFloat(e.target.value) })} className="w-full accent-blue-600 h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="mb-2">
                                        <label className="flex justify-between text-[0.65rem] text-blue-900 font-bold mb-1">
                                            Temperature <span>{areaParams.temperature}°C</span>
                                        </label>
                                        <input type="range" min="-20" max="50" step="1" value={areaParams.temperature} onChange={(e) => setAreaParams({ ...areaParams, temperature: parseFloat(e.target.value) })} className="w-full accent-blue-600 h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="mb-1">
                                        <label className="flex justify-between text-[0.65rem] text-blue-900 font-bold mb-1">
                                            Earthquake Intensity <span>{areaParams.earthquake.toFixed(1)} M</span>
                                        </label>
                                        <input type="range" min="0" max="9" step="0.5" value={areaParams.earthquake} onChange={(e) => setAreaParams({ ...areaParams, earthquake: parseFloat(e.target.value) })} className="w-full accent-blue-600 h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                </div>

                                {/* TRANSPORT */}
                                <div className="bg-white/50 p-2 rounded-lg border border-purple-100/50 shadow-xs">
                                    <h3 className="text-[0.75rem] text-slate-600 mb-2 flex items-center gap-1 font-semibold italic">🚦 Transport</h3>

                                    <div className="mb-2">
                                        <label className="flex justify-between text-[0.65rem] text-blue-900 font-bold mb-1">
                                            Traffic Density <span>{(areaParams.trafficDensity * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.05" value={areaParams.trafficDensity} onChange={(e) => setAreaParams({ ...areaParams, trafficDensity: parseFloat(e.target.value) })} className="w-full accent-purple-600 h-1 bg-purple-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="mb-2 flex justify-between items-center px-1">
                                        <span className="text-[0.65rem] text-blue-900 font-bold">Major Road Closure</span>
                                        <input type="checkbox" checked={areaParams.roadClosure} onChange={(e) => setAreaParams({ ...areaParams, roadClosure: e.target.checked })} className="accent-red-500 w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[0.65rem] text-blue-900 font-bold">Transit Network Failure</span>
                                        <input type="checkbox" checked={areaParams.publicTransportFailure} onChange={(e) => setAreaParams({ ...areaParams, publicTransportFailure: e.target.checked })} className="accent-red-500 w-3.5 h-3.5" />
                                    </div>
                                </div>

                                {/* INFRASTRUCTURE */}
                                <div className="bg-white/50 p-2 rounded-lg border border-amber-100/50 shadow-xs">
                                    <h3 className="text-[0.75rem] text-slate-600 mb-2 flex items-center gap-1 font-semibold italic">⚡ Infrastructure</h3>

                                    <div className="mb-2">
                                        <label className="flex justify-between text-[0.65rem] text-blue-900 font-bold mb-1">
                                            Power Grid Load <span>{areaParams.powerGridLoad}%</span>
                                        </label>
                                        <input type="range" min="0" max="150" step="10" value={areaParams.powerGridLoad} onChange={(e) => setAreaParams({ ...areaParams, powerGridLoad: parseFloat(e.target.value) })} className="w-full accent-amber-500 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[0.65rem] text-blue-900 font-bold">Blackout / Power Outage</span>
                                        <input type="checkbox" checked={areaParams.powerOutage} onChange={(e) => setAreaParams({ ...areaParams, powerOutage: e.target.checked })} className="accent-slate-900 w-3.5 h-3.5" />
                                    </div>
                                </div>

                                {/* POPULATION & EVENTS */}
                                <div className="bg-white/50 p-2 rounded-lg border border-emerald-100/50 shadow-xs">
                                    <h3 className="text-[0.75rem] text-slate-600 mb-2 flex items-center gap-1 font-semibold italic">👥 Population & Events</h3>

                                    <div className="mb-2">
                                        <label className="flex justify-between text-[0.65rem] text-blue-900 font-bold mb-1">
                                            Crowd Density <span>{(areaParams.crowdDensity * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.1" value={areaParams.crowdDensity} onChange={(e) => setAreaParams({ ...areaParams, crowdDensity: parseFloat(e.target.value) })} className="w-full accent-emerald-500 h-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[0.65rem] text-blue-900 font-bold">Major Public Event</span>
                                        <input type="checkbox" checked={areaParams.publicEvent} onChange={(e) => setAreaParams({ ...areaParams, publicEvent: e.target.checked })} className="accent-emerald-500 w-3.5 h-3.5" />
                                    </div>
                                </div>

                                {/* CRISIS SCENARIOS */}
                                <div className="bg-white/50 p-2 rounded-lg border-l-4 border-red-500 shadow-xs border-y border-r border-red-50/50">
                                    <h3 className="text-[0.75rem] text-red-600 mb-2 flex items-center gap-1 font-bold italic">🔥 Crisis Scenarios</h3>

                                    <div className="mb-2">
                                        <label className="flex justify-between text-[0.65rem] text-red-900 font-bold mb-1">
                                            Fire Risk Index <span>{(areaParams.fireRisk * 100).toFixed(0)}%</span>
                                        </label>
                                        <input type="range" min="0" max="1" step="0.1" value={areaParams.fireRisk} onChange={(e) => setAreaParams({ ...areaParams, fireRisk: parseFloat(e.target.value) })} className="w-full accent-red-600 h-1 bg-red-100 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="mb-2 flex justify-between items-center px-1">
                                        <span className="text-[0.65rem] text-red-900 font-bold">Hazmat Spill</span>
                                        <input type="checkbox" checked={areaParams.chemicalSpill} onChange={(e) => setAreaParams({ ...areaParams, chemicalSpill: e.target.checked })} className="accent-lime-600 w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[0.65rem] text-red-900 font-bold">Evacuation Alert</span>
                                        <input type="checkbox" checked={areaParams.evacuationOrder} onChange={(e) => setAreaParams({ ...areaParams, evacuationOrder: e.target.checked })} className="accent-red-600 w-3.5 h-3.5" />
                                    </div>
                                </div>

                                {/* CITY ASSETS & RESOURCES */}
                                <div className="bg-white/50 p-2 rounded-lg border-l-4 border-emerald-500 shadow-xs border-y border-r border-emerald-50/50">
                                    <h3 className="text-[0.75rem] text-emerald-700 mb-2 flex items-center gap-1 font-bold italic">🛡️ City Assets & Resources</h3>
                                    <div className="text-[0.6rem] text-slate-500 mb-2 italic">Set available units before running scenario</div>

                                    {[
                                        { key: 'ambulances', label: 'Ambulances', step: 5, unit: '' },
                                        { key: 'fireTrucks', label: 'Fire Trucks', step: 2, unit: '' },
                                        { key: 'policeUnits', label: 'Police Units', step: 10, unit: '' },
                                        { key: 'medicalPersonnel', label: 'Med Personnel', step: 20, unit: '' },
                                        { key: 'helicopters', label: 'Helicopters', step: 1, unit: '' },
                                        { key: 'volunteers', label: 'Volunteers', step: 50, unit: '' },
                                        { key: 'cityBudgetMil', label: 'Emergency Funds', step: 1, unit: 'M' }
                                    ].map(({ key, label, step, unit }) => (
                                        <div key={key} className="mb-2 flex justify-between items-center bg-emerald-50/50 p-1.5 rounded">
                                            <span className="text-[0.65rem] text-emerald-900 font-bold flex-1">{label}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => updateResource(key, -step)} className="w-5 h-5 flex items-center justify-center bg-white border border-emerald-200 rounded text-emerald-700 font-bold hover:bg-emerald-100 cursor-pointer">-</button>
                                                <span className="text-[0.7rem] font-bold text-slate-700 min-w-[30px] text-center">{unit ? '$' : ''}{resourceBudget[key]}{unit}</span>
                                                <button type="button" onClick={() => updateResource(key, step)} className="w-5 h-5 flex items-center justify-center bg-white border border-emerald-200 rounded text-emerald-700 font-bold hover:bg-emerald-100 cursor-pointer">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={onRunScenario}
                                className="w-full mt-4 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white border-none rounded-lg font-bold cursor-pointer shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                Run Scenario
                            </button>

                            <p className="text-[0.65rem] text-slate-500 mt-3 italic text-center">
                                *Right-click map to move selection.
                            </p>
                        </div>
                    )}

                    {cityData && (
                        <div className="mt-5 space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary hover:text-accent-blue transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showElevation}
                                    onChange={(e) => setShowElevation(e.target.checked)}
                                    className="w-4 h-4 accent-accent-blue "
                                />
                                Show Terrain Elevation Map
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary hover:text-accent-blue transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showBuildings}
                                    onChange={(e) => setShowBuildings(e.target.checked)}
                                    className="w-4 h-4 accent-accent-blue "
                                />
                                Show Buildings Footprints
                            </label>
                        </div>
                    )}

                    {cityData && (
                        <>
                            <div className="mt-8">
                                <h2 className="text-sm font-semibold mb-4 border-b border-border-subtle pb-2 flex items-center justify-between">
                                    <span>🤖 Multi-Agent Swarm</span>
                                    <span className="text-[0.65rem] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">{agentStates.length} Active</span>
                                </h2>

                                {/* Agent Swarm Overview Dashboard */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {agentStates.map(agent => (
                                        <div
                                            key={agent.name}
                                            onClick={() => setActiveAgentTab(activeAgentTab === agent.name ? null : agent.name)}
                                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 relative border ${activeAgentTab === agent.name
                                                    ? 'bg-blue-50 border-accent-blue shadow-sm'
                                                    : 'bg-slate-50 border-border-subtle hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="text-[0.65rem] font-bold text-text-primary mb-1 truncate">{agent.name.replace('Agent', '')}</div>
                                            <div className="flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                                <span className="text-[0.6rem] color-text-secondary capitalize font-medium">{agent.status}</span>
                                            </div>
                                            {agent.alerts.length > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[14px] h-14px px-1 rounded-full flex items-center justify-center font-black shadow-md">{agent.alerts.length}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Individual Agent Deep Dive Dashboard */}
                                {activeAgentTab && (
                                    <div className="bg-slate-900 rounded-xl p-4 text-white mb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                        {agentStates.filter(a => a.name === activeAgentTab).map(agent => (
                                            <div key={agent.name}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-sm text-blue-400 font-bold">{agent.name}</h3>
                                                        <p className="text-[0.65rem] text-slate-400 mt-0.5">{agent.description}</p>
                                                    </div>
                                                    <button onClick={() => setActiveAgentTab(null)} className="bg-white/10 border-none text-white cursor-pointer rounded px-1.5 py-0.5 hover:bg-white/20 transition-colors">×</button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                                                        <div className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-wider">Ticks</div>
                                                        <div className="text-sm font-black">{agent.metrics?.totalTicks || 0}</div>
                                                    </div>
                                                    <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                                                        <div className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-wider">AI Calls</div>
                                                        <div className="text-sm font-black">{agent.metrics?.aiCalls || 0}</div>
                                                    </div>
                                                    <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                                                        <div className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-wider">Latency</div>
                                                        <div className="text-sm font-black">{agent.metrics?.lastRunMs || 0}ms</div>
                                                    </div>
                                                </div>

                                                <div className="text-[0.65rem] font-bold text-slate-500 mb-2 uppercase tracking-widest">Recent Alerts</div>
                                                <div className="max-h-[120px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                    {agent.alerts.length === 0 ? (
                                                        <div className="text-[0.7rem] text-slate-600 text-center py-4 italic">No recent alerts recorded.</div>
                                                    ) : (
                                                        agent.alerts.map(alert => (
                                                            <div key={alert.id} className="text-[0.7rem] bg-white/5 p-2 rounded border-l-2 border-blue-500 hover:bg-white/10 transition-colors">
                                                                <div className="text-slate-200 leading-tight">{alert.message}</div>
                                                                <div className="text-slate-500 text-[0.6rem] mt-1 flex justify-between">
                                                                    <span>{alert.timestamp}</span>
                                                                    <span className="font-bold uppercase tracking-tighter text-blue-400/80">{alert.severity}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <h2 className="text-sm font-semibold mb-4 border-b border-border-subtle pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                                    Global Event Feed
                                </h2>

                                {sensorData && (
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 border border-border-subtle rounded-lg p-3">
                                            <h3 className="text-[0.65rem] uppercase tracking-wider text-text-secondary mb-1">Weather</h3>
                                            <div className="text-sm font-bold text-text-primary">{sensorData.weather.temp.toFixed(1)}°C</div>
                                            <div className="text-[0.65rem] text-text-secondary font-medium">{sensorData.weather.condition}</div>
                                        </div>
                                        <div className="bg-slate-50 border border-border-subtle rounded-lg p-3">
                                            <h3 className="text-[0.65rem] uppercase tracking-wider text-text-secondary mb-1">Traffic</h3>
                                            <div className="text-sm font-bold text-text-primary">{sensorData.traffic.length} active</div>
                                            <div className="text-[0.65rem] text-text-secondary font-medium">congestion nodes</div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-slate-950 rounded-lg p-3 min-h-[150px] max-h-[300px] overflow-y-auto shadow-inner border border-white/5 custom-scrollbar">
                                    <div className="text-[0.7rem] text-slate-500 mb-3 text-center font-bold tracking-[0.2em] uppercase">City Alert Feed</div>
                                    {activeAlerts.length === 0 ? (
                                        <div className="text-slate-700 text-[0.75rem] italic text-center mt-10">Scanning autonomous datasets...</div>
                                    ) : (
                                        activeAlerts.map(alert => (
                                            <div key={alert.id} className={`mb-2 p-2.5 rounded border-l-4 animate-in slide-in-from-left duration-300 ${alert.severity === 'high'
                                                    ? 'bg-red-950/40 border-red-600'
                                                    : 'bg-slate-900 border-blue-600'
                                                }`}>
                                                <div className="flex justify-between mb-1">
                                                    <span className={`text-[0.65rem] font-black uppercase tracking-widest ${alert.severity === 'high' ? 'text-red-400' : 'text-blue-400'
                                                        }`}>{alert.agent}</span>
                                                    <span className="text-[0.6rem] text-slate-600 font-mono">{alert.timestamp}</span>
                                                </div>
                                                <div className="text-[0.75rem] text-slate-200 leading-snug mb-2 font-medium">{alert.message}</div>

                                                {(alert.type === 'flood_warning' || alert.type === 'flood' || alert.type === 'accident' || alert.type === 'emergency_dispatch') && (
                                                    <button
                                                        onClick={() => setSelectedAlertForPlan(alert)}
                                                        className="bg-linear-to-r from-purple-600 to-blue-600 text-white border-none rounded px-3 py-1 text-[0.65rem] font-black cursor-pointer tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
                                                    >
                                                        🏛 ACTION PLAN
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-sm font-semibold mb-4 border-b border-border-subtle pb-2">Infrastructure Stats</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-bg-primary border border-border-subtle rounded-lg p-3">
                                        <h3 className="text-[0.65rem] uppercase tracking-wider text-text-secondary mb-1">Nodes</h3>
                                        <div className="text-lg font-bold text-text-primary">{cityData.nodes?.length || 0}</div>
                                    </div>
                                    <div className="bg-bg-primary border border-border-subtle rounded-lg p-3">
                                        <h3 className="text-[0.65rem] uppercase tracking-wider text-text-secondary mb-1">Edges</h3>
                                        <div className="text-lg font-bold text-text-primary">{cityData.edges?.length || 0}</div>
                                    </div>
                                    <div className="bg-bg-primary border border-border-subtle rounded-lg p-3">
                                        <h3 className="text-[0.65rem] uppercase tracking-wider text-text-secondary mb-1">Hospitals</h3>
                                        <div className="text-lg font-bold text-text-primary">{cityData.infrastructure?.hospitals || 0}</div>
                                    </div>
                                    <div className="bg-bg-primary border border-border-subtle rounded-lg p-3">
                                        <h3 className="text-[0.65rem] uppercase tracking-wider text-text-secondary mb-1">Police / Fire</h3>
                                        <div className="text-lg font-bold text-text-primary">{cityData.infrastructure?.emergency || 0}</div>
                                    </div>
                                </div>

                                <p className="mt-4 text-[0.7rem] text-text-secondary font-mono bg-slate-50 p-2 rounded border border-slate-100 flex justify-center gap-2">
                                    <span className="opacity-40">CENTER:</span>
                                    <span>{cityData.center[1].toFixed(4)}°N, {cityData.center[0].toFixed(4)}°E</span>
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
