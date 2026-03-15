import React, { useState } from 'react';
import { generateActionPlan } from '../agents/ActionPlanAgent';

const SEVERITY_COLOR = {
    high: { border: 'border-red-500', bg: 'bg-red-950/90', badge: 'text-red-300', glow: 'shadow-red-500/20' },
    medium: { border: 'border-amber-500', bg: 'bg-amber-950/90', badge: 'text-amber-300', glow: 'shadow-amber-500/20' },
    low: { border: 'border-blue-500', bg: 'bg-slate-900/90', badge: 'text-blue-300', glow: 'shadow-blue-500/20' },
};

function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/^# (.+)$/gm, '<h1 class="text-xl font-extrabold text-slate-50 mt-5 mb-2 border-b border-slate-700 pb-2">$1</h1>')
        .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-slate-200 mt-4 mb-2">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-slate-300 mt-3 mb-1">$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100 font-bold">$1</strong>')
        .replace(/^---$/gm, '<hr class="border-slate-700 my-3"/>')
        .replace(/^\|(.+)\|$/gm, (_, row) => {
            const isSep = row.split('|').every(c => /^[-: ]+$/.test(c.trim()));
            if (isSep) return '';
            const cells = row.split('|').map(c => `<td class="p-2 border border-slate-700 text-[0.75rem] text-slate-300">${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        })
        .replace(/((<tr>.*<\/tr>\s*)+)/gs, '<table class="w-full border-collapse my-2">$1</table>')
        .replace(/^[\*\-] (.+)$/gm, '<li class="my-1 text-[0.8rem] text-slate-300 leading-relaxed">$1</li>')
        .replace(/((<li.*<\/li>\s*)+)/gs, '<ul class="my-2 ml-4 list-disc">$1</ul>')
        .replace(/\n/g, '<br/>');
}

export default function ActionPlanModal({ alert, cityData, cityName, sensorData, elevationSamples, onClose }) {
    const [plan, setPlan] = useState(null);
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const severity = SEVERITY_COLOR[alert.severity] || SEVERITY_COLOR.low;

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setPlan(null);
        try {
            const result = await generateActionPlan({ alert, cityData, sensorData, elevationSamples });
            if (result.plan) {
                setPlan(result.plan);
                setSource(result.source);
            } else {
                setError(result.error || 'Failed to generate action plan.');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const [isPublished, setIsPublished] = useState(false);

    const handlePublish = async () => {
        if (!plan) return;

        try {
            // Import Supabase dynamically or at top level (assuming top level for now)
            const { supabase } = await import('../services/supabaseClient.js');

            // Build the comprehensive payload for the Query Engine
            const queryEngineFeeder = {
                calamity: {
                    type: alert.type,
                    message: alert.message,
                    location: {
                        lat: alert.lat,
                        lon: alert.lon
                    }
                },
                weatherAndEnvironment: {
                    temperature: sensorData?.areaConfig?.params?.temperature,
                    windSpeed: sensorData?.areaConfig?.params?.windSpeed,
                    rainfall: sensorData?.areaConfig?.params?.rainfall,
                    fog: sensorData?.areaConfig?.params?.fog,
                    earthquake: sensorData?.areaConfig?.params?.earthquake,
                    airQuality: sensorData?.areaConfig?.params?.airQuality
                },
                infrastructureAndTransport: {
                    powerGridLoad: sensorData?.areaConfig?.params?.powerGridLoad,
                    powerOutage: sensorData?.areaConfig?.params?.powerOutage,
                    waterPressure: sensorData?.areaConfig?.params?.waterPressure,
                    cellTowerCongestion: sensorData?.areaConfig?.params?.cellTowerCongestion,
                    trafficDensity: sensorData?.areaConfig?.params?.trafficDensity,
                    roadClosure: sensorData?.areaConfig?.params?.roadClosure,
                    publicTransportFailure: sensorData?.areaConfig?.params?.publicTransportFailure
                },
                populationAndCrisis: {
                    crowdDensity: sensorData?.areaConfig?.params?.crowdDensity,
                    publicEvent: sensorData?.areaConfig?.params?.publicEvent,
                    evacuationOrder: sensorData?.areaConfig?.params?.evacuationOrder,
                    fireRisk: sensorData?.areaConfig?.params?.fireRisk,
                    chemicalSpill: sensorData?.areaConfig?.params?.chemicalSpill
                },
                resources: sensorData?.areaConfig?.resources,
                topography: {
                    elevationAtSite: elevationSamples
                        ? elevationSamples.find(s => Math.abs(s.lat - alert.lat) < 0.01 && Math.abs(s.lon - alert.lon) < 0.01)?.elevation
                        : null
                },
                actionPlanSummary: plan.substring(0, 500) + '...' // Brief summary for quick context
            };

            const payload = {
                city_name: (cityName || cityData?.name || 'unknown').trim().toLowerCase(),
                health: 50, // This would ideally be calculated or passed down
                traffic_anomalies: sensorData?.traffic?.length || 0,
                alerts: [alert], // The active alert driving this plan
                weather: sensorData?.weather || {},
                action_plan: {
                    plan: plan,
                    source: source,
                    timestamp: new Date().toISOString()
                },
                query_engine_feeder: queryEngineFeeder
            };

            console.log('🚀 [Supabase] Upserting City State:', payload);

            const { error: dbError } = await supabase
                .from('city_stats')
                .upsert(payload, { onConflict: 'city_name' });

            if (dbError) throw dbError;

            // Also update local storage as a fallback
            localStorage.setItem('citybuddy_published_action_plan', JSON.stringify({
                alertType: alert.type,
                alertMessage: alert.message,
                timestamp: Date.now(),
                plan: plan,
                source: source
            }));

            setIsPublished(true);
            setTimeout(() => setIsPublished(false), 3000);

        } catch (err) {
            console.error('[Supabase] Failed to publish action plan to DB:', err);
            setError(`Failed to publish to database: ${err.message}`);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center backdrop-blur-sm p-4"
        >
            <div
                onClick={e => e.stopPropagation()}
                className={`w-full max-w-[860px] max-h-[90vh] bg-slate-900 rounded-2xl flex flex-col border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${severity.border} ${severity.glow}`}
            >
                {/* Header */}
                <div className={`p-5 flex justify-between items-start shrink-0 border-b ${severity.bg} ${severity.border}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-black/30 ${severity.badge}`}>
                                ⚠ {alert.type?.replace(/_/g, ' ')} · {alert.severity?.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                        </div>
                        <div className="text-sm text-slate-200 font-medium leading-relaxed max-w-[600px]">
                            {alert.message}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight font-bold">
                            📍 {alert.lat?.toFixed(5)}, {alert.lon?.toFixed(5)} &nbsp;|&nbsp; Agent: {alert.agent}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/10 border-none text-slate-400 hover:text-white cursor-pointer rounded-lg px-3 py-1.5 text-lg transition-colors"
                    >✕</button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {!plan && !loading && (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">🏛️</div>
                            <div className="text-xl font-black text-slate-100 mb-2 tracking-tight">
                                Mayor's Crisis Action Plan
                            </div>
                            <div className="text-sm text-slate-400 mb-8 max-w-[440px] mx-auto leading-relaxed">
                                The system will analyze hospitals ({cityData?.infrastructure?.hospitals || 0}),
                                emergency stations, traffic patterns, and weather to generate
                                a high-precision, actionable response strategy.
                            </div>
                            <button
                                onClick={handleGenerate}
                                className="bg-linear-to-r from-purple-600 to-blue-600 text-white border-none rounded-xl px-8 py-3.5 text-sm font-black cursor-pointer shadow-xl shadow-purple-900/40 transition-transform active:scale-95 hover:scale-[1.02]"
                            >
                                GENERATE STRATEGY WITH AI ✨
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin mx-auto mb-4" />
                            <div className="text-slate-400 text-sm font-bold tracking-widest animate-pulse">
                                ANALYZING CRISIS VECTORS...
                            </div>
                            <div className="text-slate-600 text-[10px] mt-2 font-mono uppercase">
                                hospital metrics · congestion signals · elevation graphs
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm font-medium">
                            ⚠ SYSTEM ERROR: {error}
                        </div>
                    )}

                    {plan && (
                        <div className="animate-in fade-in duration-700">
                            <div className="flex items-center justify-between mb-5">
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded border ${source === 'gemini'
                                    ? 'text-purple-300 bg-purple-950/30 border-purple-500/30'
                                    : 'text-emerald-300 bg-emerald-950/30 border-emerald-500/30'
                                    }`}>
                                    {source === 'gemini' ? '✦ Gemini Intelligence Engine' : '⚙ Local Network Logic'}
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    className="bg-white/5 border border-slate-700 text-slate-400 hover:text-white cursor-pointer rounded-lg px-3 py-1 text-[10px] font-bold uppercase transition-all"
                                >↻ Regenerate</button>
                            </div>

                            <div
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(plan) }}
                                className="text-slate-300 leading-relaxed text-[0.85rem] prose prose-invert max-w-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/50 shrink-0">
                    <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase italic">
                        CityBuddy OS · High-Trust Environment
                    </span>
                    <div className="flex gap-3">
                        {plan && (
                            <button
                                onClick={handlePublish}
                                className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-lg ${isPublished
                                    ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                                    : 'bg-blue-600 text-white shadow-blue-900/40 hover:bg-blue-500'
                                    }`}
                            >
                                {isPublished ? '✓ Data Published' : '📢 Notify Citizens'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer"
                        >Dismiss</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
