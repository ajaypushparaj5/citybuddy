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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 font-inter">
      <div className="w-full max-w-xl text-center glass-soft bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-xl">
        
        <ShieldAlert size={64} className="mx-auto mb-6 text-blue-400" />

        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Citizen Portal
        </h1>

        <p className="text-white/70 text-base md:text-lg mt-3 mb-10 leading-relaxed">
          Select a city to view real-time safety, transit, and traffic updates
          powered by the AI Digital Twin.
        </p>

        <form onSubmit={handleCitySearch} className="flex gap-3">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Enter your city (e.g. San Francisco)"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-white/20 transition-all"
          />

          <button
            type="submit"
            disabled={isLoadingCity}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all
            ${
              isLoadingCity
                ? "bg-white/10 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {isLoadingCity ? (
              <Loader className="spin text-white" size={20} />
            ) : (
              <Search size={20} className="text-white" />
            )}
            <span className="text-white">Monitor</span>
          </button>
        </form>

        {cityError && (
          <p className="text-red-400 mt-4 font-medium">{cityError}</p>
        )}

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes spin { 
                100% { transform: rotate(360deg); } 
              }
              .spin { 
                animation: spin 1s linear infinite; 
              }
            `,
          }}
        />
      </div>
    </div>
  );
}

   return (
<div className="bg-[#0a0a0f] min-h-screen font-inter text-white flex">

{/* SIDEBAR */}

<div className="w-[260px] border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col p-6 gap-6 sticky top-0 h-screen">

<div className="text-xl font-semibold tracking-tight">
CityTwin
</div>

<nav className="flex flex-col gap-2 text-sm">

<a href="#alerts" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2">
<ShieldAlert size={16}/> Alerts
</a>

<a href="#plan" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2">
<Info size={16}/> Authority Plan
</a>

<a href="#chat" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2">
<Search size={16}/> CityBuddy
</a>

<a href="#traffic" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2">
<Navigation size={16}/> Traffic
</a>

<a href="#emergency" className="px-4 py-2 rounded-lg hover:bg-white/10 transition flex items-center gap-2">
<PhoneCall size={16}/> Emergency
</a>

</nav>

<div className="mt-auto text-xs text-white/40">
AI Digital Twin Monitoring
</div>

</div>


{/* MAIN CONTENT */}

<div className="flex-1 px-10 py-10 overflow-y-auto">

<div className="max-w-[1100px] mx-auto">

{/* Header */}

<div className="flex justify-between items-center mb-10">

<div>
<h1 className="text-4xl font-bold tracking-tight">
Citizen Portal: {cityData.name || searchCity}
</h1>

<p className="text-white/60 mt-1">
Real-time public information and safety alerts for your city.
</p>
</div>

<button
onClick={() => setIsReportModalOpen(true)}
className="bg-white text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-[1.02] transition"
>
<Send size={18}/>
Report Incident
</button>

</div>


{/* ALERTS */}

<section
id="alerts"
className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6"
>

<h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
<ShieldAlert className="text-red-400"/>
Live AI Crisis Alerts
</h2>

{publicAlerts.length === 0 ? (

<div className="text-center py-10 text-white/40">
No active crisis alerts right now.
</div>

) : (

<div className="flex flex-col gap-3">

{publicAlerts.map(alert => (

<div
key={alert.id}
className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
>

<div className="flex justify-between mb-1">

<span className="font-semibold text-red-400 text-xs uppercase">
⚠️ {alert.type} Warning
</span>

<span className="text-xs text-white/50">
{alert.timestamp}
</span>

</div>

<p className="text-sm text-white/80">
{alert.message}
</p>

</div>

))}

</div>

)}

</section>


{/* PLAN */}

{publishedPlan && (

<section
id="plan"
className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6"
>

<h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
<ShieldAlert className="text-emerald-400"/>
Official Authority Action Plan
</h2>

<div
dangerouslySetInnerHTML={{
__html: renderMarkdown(publishedPlan.plan)
}}
className="text-sm text-white/80"
/>

</section>

)}


{/* CHAT */}

<section
id="chat"
className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6"
>

<h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
<Search className="text-violet-400"/>
Ask CityBuddy
</h2>

<div className="flex flex-col h-[350px] bg-black/30 rounded-xl border border-white/10">

<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

{chatHistory.map((msg, idx) => (

<div
key={idx}
className={`flex ${
msg.role === "user" ? "justify-end" : "justify-start"
}`}
>

<div
className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
msg.role === "user"
? "bg-white text-black"
: "bg-white/10 text-white"
}`}
>

{msg.text}

</div>

</div>

))}

</div>


<div className="border-t border-white/10 p-3">

<form onSubmit={handleChatSubmit} className="flex gap-2">

<input
type="text"
value={chatQuery}
onChange={(e)=>setChatQuery(e.target.value)}
placeholder="Ask about traffic, weather..."
className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm"
/>

<button
type="submit"
className="bg-violet-500 w-10 h-10 rounded-full flex items-center justify-center"
>

<Send size={16}/>

</button>

</form>

</div>

</div>

</section>


{/* TRAFFIC */}

<section
id="traffic"
className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6"
>

<h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
<Navigation className="text-emerald-400"/>
Live Traffic
</h2>

<div className="text-white/70">
{trafficAnomalies} Congested Zones
</div>

</section>


{/* EMERGENCY */}

<section
id="emergency"
className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
>

<h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
<PhoneCall className="text-sky-400"/>
Emergency Contacts
</h2>

<ul className="flex flex-col gap-3 text-sm">

<li className="flex justify-between">
<span>Police</span>
<span className="text-sky-400">911</span>
</li>

<li className="flex justify-between">
<span>Fire</span>
<span className="text-sky-400">911</span>
</li>

<li className="flex justify-between">
<span>Disaster</span>
<span className="text-sky-400">311</span>
</li>

</ul>

</section>

</div>
</div>


{/* FLOATING QUERY BOT */}

<button
onClick={() => {
document.getElementById("chat").scrollIntoView({ behavior: "smooth" });
}}
className="fixed bottom-6 right-6 bg-violet-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
>

<Search size={22}/>

           </button>
           

</div>
);
}
