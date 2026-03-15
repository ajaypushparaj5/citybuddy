import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bus, Radio, MapPin, PhoneCall, ShieldAlert, Navigation, Info, Send, Search, Loader, X } from 'lucide-react';
import { dataIntegrationService } from '../services/dataIntegrationService';
import { agentManager } from '../agents/CityAgentManager';
import { fetchCityData } from '../services/osmService';
import { QueryAgent } from '../agents/QueryAgent';
import { renderMarkdown } from '../utils/markdownRenderer';

const queryBot = new QueryAgent();

// Mock Data for aesthetics
const MOCK_BROADCASTS = [
    { id: 1, text: "Road maintenance scheduled on Highway A12 starting midnight. Expect diversions.", time: "10 mins ago" },
    { id: 2, text: "Annual City Marathon tomorrow. Downtown area will be restricted from 6 AM to 2 PM.", time: "2 hours ago" }
];


export default function CitizenDashboard() {
    const [cityHealth, setCityHealth] = useState({ score: 100, status: 'Stable' });
    const [publicAlerts, setPublicAlerts] = useState([]);
    const [trafficAnomalies, setTrafficAnomalies] = useState(0);
    const [reportForm, setReportForm] = useState({ type: 'Traffic Accident', location: '', description: '', photo: null, coords: null });
    const [reportStatus, setReportStatus] = useState(null);
    const [newsBroadcasts, setNewsBroadcasts] = useState([]);

    // New Feature States
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [searchCity, setSearchCity] = useState('');
    const [isLoadingCity, setIsLoadingCity] = useState(false);
    const [cityData, setCityData] = useState(null);
    const [cityError, setCityError] = useState(null);

    const [publishedPlan, setPublishedPlan] = useState(null);
    const [latestTickData, setLatestTickData] = useState(null);
    const [chatQuery, setChatQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: 'Hello! I am CityBuddy. Ask me anything about current traffic, weather, or emergencies.' }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const fetchNews = async (city) => {
        try {
            const apiKey = import.meta.env.VITE_NEWS_API_KEY;
            const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(city + " city")}&sortBy=publishedAt&pageSize=3&apiKey=${apiKey}`);
            const data = await res.json();
            if (data.articles && data.articles.length > 0) {
                setNewsBroadcasts(data.articles.map((a, i) => ({
                    id: i,
                    text: a.title,
                    time: new Date(a.publishedAt).toLocaleTimeString()
                })));
            } else {
                setNewsBroadcasts(MOCK_BROADCASTS);
            }
        } catch (e) {
            console.warn("News fetch failed, using mock", e);
            setNewsBroadcasts(MOCK_BROADCASTS);
        }
    };

    const handleCitySearch = async (e) => {
        e.preventDefault();
        if (!searchCity.trim()) return;
        setIsLoadingCity(true);
        setCityError(null);
        try {
            const data = await fetchCityData(searchCity);
            setCityData(data);
            fetchNews(searchCity);
        } catch (err) {
            setCityError(err.message || "Failed to load city data.");
        } finally {
            setIsLoadingCity(false);
        }
    };

    useEffect(() => {
        if (cityData) {
            agentManager.init(cityData, () => { });
            dataIntegrationService.start(cityData.bbox, cityData.edges);

            return () => {
                dataIntegrationService.stop();
            };
        }
    }, [cityData]);

    useEffect(() => {
        const handleTick = (data) => {
            setLatestTickData(data); // Save for QueryAgent context
            const heavyTraffic = data.traffic.filter(t => t.level === 'heavy');
            setTrafficAnomalies(heavyTraffic.length);

            let score = 100 - (heavyTraffic.length * 2);
            if (data.abnormalConditions && data.abnormalConditions.length > 0) {
                score -= (data.abnormalConditions.length * 5);
            }

            let status = 'Stable';
            if (score < 70) status = 'Warning';
            if (score < 50) status = 'Critical';

            setCityHealth({ score: Math.max(0, score), status });
        };

        // Poll LocalStorage for published action plan
        const checkPlan = () => {
            const planStr = localStorage.getItem('citybuddy_published_action_plan');
            if (planStr) {
                try {
                    setPublishedPlan(JSON.parse(planStr));
                } catch (e) { }
            }
        };
        checkPlan();
        const planInterval = setInterval(checkPlan, 3000);

        const handleAlerts = (activeAlerts) => {
            const publicFacing = activeAlerts.filter(a => a.severity === 'high' || a.severity === 'medium');
            setPublicAlerts(publicFacing);
        };

        const unsubscribeTick = dataIntegrationService.subscribe(handleTick);
        const unsubscribeAlerts = agentManager.subscribe(handleAlerts);

        return () => {
            unsubscribeTick();
            unsubscribeAlerts();
            clearInterval(planInterval);
        };
    }, []);

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatQuery.trim() || isChatLoading) return;

        const userMsg = chatQuery.trim();
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatQuery('');
        setIsChatLoading(true);

        const fullState = {
            cityData: cityData,
            sensorData: latestTickData,
            areaParams: latestTickData?.areaConfig?.params || {}
        };

        const response = await queryBot.handleQuery(userMsg, fullState, publicAlerts);

        setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
        setIsChatLoading(false);
    };

    const getGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setReportForm({ ...reportForm, location: `Auto-GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`, coords: { lat, lon } });
                },
                (error) => {
                    alert("Error fetching location. Please enter manually.");
                }
            );
        } else {
            alert("Geolocation is not available.");
        }
    };

    const handleReportSubmit = (e) => {
        e.preventDefault();

        if (!reportForm.photo) {
            setReportStatus("⚠️ Error: A photo upload is strictly required to submit a report.");
            return;
        }

        // Simple Duplicate Detection
        const isDuplicate = publicAlerts.some(alert =>
            alert.type.toLowerCase().includes(reportForm.type.toLowerCase()) ||
            alert.message.toLowerCase().includes(reportForm.type.toLowerCase())
        );

        if (isDuplicate) {
            setReportStatus(`✅ Possible duplicate detected. Your photo and report for "${reportForm.type}" have been merged with an existing ongoing incident.`);
        } else {
            setReportStatus("✅ Report submitted! City Agents are analyzing the situation.");
            // Inject to Swarm
            dataIntegrationService.injectAnomaly({
                type: 'citizen_report',
                subtype: reportForm.type,
                description: reportForm.description,
                lat: reportForm.coords ? reportForm.coords.lat : (cityData.center[1] + (Math.random() - 0.5) * 0.01),
                lon: reportForm.coords ? reportForm.coords.lon : (cityData.center[0] + (Math.random() - 0.5) * 0.01),
                severity: 'high'
            });
        }

        setTimeout(() => {
            setReportStatus(null);
            setIsReportModalOpen(false);
            setReportForm({ type: 'Traffic Accident', location: '', description: '', photo: null, coords: null });
        }, 3000);
    };

    if (!cityData) {
        return (
            <div style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '10vh auto', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                <ShieldAlert size={64} color="#3b82f6" style={{ margin: '0 auto 1.5rem' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Citizen Portal</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
                    Select a city to view real-time safety, transit, and traffic updates powered by the AI Digital Twin.
                </p>
                <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        placeholder="Enter your city (e.g. San Francisco)"
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                    />
                    <button
                        type="submit"
                        disabled={isLoadingCity}
                        style={{
                            background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: '12px',
                            border: 'none', fontWeight: 600, cursor: isLoadingCity ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        {isLoadingCity ? <Loader className="spin" size={20} /> : <Search size={20} />}
                        Monitor
                    </button>
                </form>
                {cityError && <p style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 500 }}>{cityError}</p>}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                 `}} />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Citizen Portal: {cityData.name || searchCity}</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>Real-time public information and safety alerts for your city.</p>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}
                    >
                        <Send size={20} /> Report Incident
                    </button>
                    <div style={{ textAlign: 'right', background: cityHealth.status === 'Stable' ? '#ecfdf5' : '#fff1f2', padding: '1rem', borderRadius: '1rem', border: `1px solid ${cityHealth.status === 'Stable' ? '#6ee7b7' : '#fca5a5'}` }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>City Health</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: cityHealth.status === 'Stable' ? '#059669' : '#e11d48' }}>
                            {cityHealth.score}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: cityHealth.status === 'Stable' ? '#10b981' : '#f43f5e', fontWeight: 600 }}>{cityHealth.status}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>

                {/* Main Content Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Live Crisis Alerts (Linked to AI Swarm) */}
                    <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '4px solid #ef4444' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert color="#ef4444" /> Live AI Crisis Alerts
                        </h2>
                        {publicAlerts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                <ShieldAlert size={32} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                                No active crisis alerts right now.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {publicAlerts.map(alert => (
                                    <div key={alert.id} style={{ padding: '1rem', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', fontSize: '0.8rem' }}>⚠️ {alert.type} Warning</span>
                                            <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{alert.timestamp}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.95rem' }}>{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Published Action Plan */}
                    {publishedPlan && (
                        <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldAlert color="#10b981" /> Official Authority Action Plan
                                </h2>
                                <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                    PUBLISHED: {new Date(publishedPlan.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem' }}>
                                <div style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #cbd5e1' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                                        Response To: {publishedPlan.alertType?.replace(/_/g, ' ')}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                                        {publishedPlan.alertMessage}
                                    </div>
                                </div>
                                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(publishedPlan.plan) }} style={{ fontSize: '0.85rem', color: '#334155' }} />
                            </div>
                        </section>
                    )}

                    {/* AI Chatbot Interface */}
                    <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '4px solid #8b5cf6' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Search color="#8b5cf6" /> Ask CityBuddy
                        </h2>
                        <div style={{ background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '350px' }}>

                            {/* Chat History */}
                            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '1rem',
                                            background: msg.role === 'user' ? '#4f46e5' : '#e2e8f0',
                                            color: msg.role === 'user' ? 'white' : '#0f172a',
                                            fontSize: '0.9rem', lineHeight: 1.4,
                                            borderBottomRightRadius: msg.role === 'user' ? 0 : '1rem',
                                            borderBottomLeftRadius: msg.role === 'user' ? '1rem' : 0
                                        }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <div style={{ background: '#e2e8f0', padding: '0.75rem 1rem', borderRadius: '1rem', borderBottomLeftRadius: 0 }}>
                                            <Loader className="spin" size={16} color="#64748b" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div style={{ padding: '0.75rem', borderTop: '1px solid #e2e8f0', background: 'white', borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
                                <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={chatQuery}
                                        onChange={(e) => setChatQuery(e.target.value)}
                                        placeholder="Ask about traffic, weather, or safe zones..."
                                        disabled={isChatLoading}
                                        style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '2rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isChatLoading || !chatQuery.trim()}
                                        style={{
                                            background: '#8b5cf6', color: 'white', border: 'none', width: '40px', height: '40px',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: (isChatLoading || !chatQuery.trim()) ? 'not-allowed' : 'pointer',
                                            opacity: (isChatLoading || !chatQuery.trim()) ? 0.6 : 1
                                        }}
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>

                        </div>
                    </section>

                    {/* City Live Broadcast */}
                    <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '4px solid #3b82f6' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Radio color="#3b82f6" /> City Authority Broadcasts
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {newsBroadcasts.map(msg => (
                                <div key={msg.id} style={{ padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <Info color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.95rem', lineHeight: 1.4 }}>{msg.text}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.25rem', display: 'block' }}>{msg.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Sidebar Content Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Traffic Status Widget */}
                    <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Navigation color="#10b981" /> Live Traffic
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: trafficAnomalies > 5 ? '#fef2f2' : '#f0fdf4', borderRadius: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: trafficAnomalies > 5 ? '#ef4444' : '#10b981', boxShadow: `0 0 10px ${trafficAnomalies > 5 ? '#ef4444' : '#10b981'}` }}></div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: trafficAnomalies > 5 ? '#991b1b' : '#065f46' }}>{trafficAnomalies} Congested Zones</div>
                                <div style={{ fontSize: '0.8rem', color: trafficAnomalies > 5 ? '#b91c1c' : '#047857' }}>Across monitored city areas</div>
                            </div>
                        </div>
                        <button style={{ width: '100%', marginTop: '1rem', background: 'white', border: '1px solid #cbd5e1', padding: '0.5rem', borderRadius: '0.5rem', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                            Request Safe Route
                        </button>
                    </section>



                    {/* Emergency Contacts */}
                    <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#1e293b', color: 'white' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PhoneCall color="#38bdf8" /> Emergency Contacts
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Police / Emergency</span> <span style={{ fontWeight: 700, color: '#38bdf8' }}>911</span></li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Fire Department</span> <span style={{ fontWeight: 700, color: '#38bdf8' }}>911</span></li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}><span>Disaster Management</span> <span style={{ fontWeight: 700, color: '#38bdf8' }}>311</span></li>
                        </ul>
                    </section>

                </div>
            </div>

            {/* Incident Reporting Modal */}
            {isReportModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Send color="#6366f1" /> Report an Incident
                            </h2>
                            <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Incident Type</label>
                                <select
                                    value={reportForm.type}
                                    onChange={e => setReportForm({ ...reportForm, type: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                >
                                    <option value="Traffic Accident">Traffic Accident</option>
                                    <option value="Road Block / Obstruction">Road Block / Obstruction</option>
                                    <option value="Flood / Waterlogging">Flood / Waterlogging</option>
                                    <option value="Fire / Hazard">Fire / Hazard</option>
                                    <option value="Infrastructure Damage">Infrastructure Damage</option>
                                    <option value="Public Safety Issue">Public Safety Issue</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Approximate Location</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Main St Bridge"
                                        value={reportForm.location}
                                        onChange={e => setReportForm({ ...reportForm, location: e.target.value })}
                                        style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                    />
                                    <button type="button" onClick={getGeolocation} style={{ padding: '0 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>
                                        <MapPin size={18} /> Auto-GPS
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Short Description</label>
                                <textarea
                                    required
                                    placeholder="Describe the incident (e.g. Fallen tree blocking one lane)"
                                    value={reportForm.description}
                                    onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'vertical' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Photo Upload (Required)</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*"
                                    onChange={e => setReportForm({ ...reportForm, photo: e.target.files[0] })}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', background: '#f8fafc' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>Helps prevent fraudulent reports.</span>
                            </div>

                            <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s', marginTop: '0.5rem' }}>
                                Submit to City AI
                            </button>
                            {reportStatus && (
                                <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.5rem', fontSize: '0.95rem', textAlign: 'center', fontWeight: 500 }}>
                                    {reportStatus}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
