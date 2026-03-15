import React, { useState } from 'react';
import TrafficVideo from '../components/TrafficVideo';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Car, AlertCircle, Cpu, ClipboardList, ShieldCheck } from 'lucide-react';

function Traffic() {
    const [trafficStats, setTrafficStats] = useState({
        vehicleCount: 0,
        congestionLevel: '-',
        incidentPayload: null,
        recommendationPayload: null
    });

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#F8FAFC] font-inter text-[#1E293B] overflow-hidden">
            {/* Sidebar */}
            <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Activity size={20} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Traffic AI Engine</h1>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Real-time flow analysis and spatial intelligence.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Live Analysis */}
                    <div>
                        <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4 flex items-center gap-2">
                            <Cpu size={14} /> Neural Tracking Data
                        </h2>
                        
                        <div className="grid gap-3">
                            <motion.div 
                                whileHover={{ y: -2 }}
                                className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm ${
                                    trafficStats.congestionLevel === 'HIGH' ? 'bg-rose-50 border-rose-100' :
                                    trafficStats.congestionLevel === 'MODERATE' ? 'bg-amber-50 border-amber-100' :
                                    trafficStats.congestionLevel === 'LOW' ? 'bg-emerald-50 border-emerald-100' :
                                    'bg-slate-50 border-slate-100'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">Congestion Index</h3>
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                                        trafficStats.congestionLevel === 'HIGH' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' :
                                        trafficStats.congestionLevel === 'MODERATE' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                                        trafficStats.congestionLevel === 'LOW' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                                        'bg-slate-300'
                                    }`} />
                                </div>
                                <div className={`text-3xl font-bold tracking-tight ${
                                    trafficStats.congestionLevel === 'HIGH' ? 'text-rose-700' :
                                    trafficStats.congestionLevel === 'MODERATE' ? 'text-amber-700' :
                                    trafficStats.congestionLevel === 'LOW' ? 'text-emerald-700' :
                                    'text-slate-900'
                                }`}>
                                    {trafficStats.congestionLevel}
                                </div>
                            </motion.div>

                            <motion.div 
                                whileHover={{ y: -2 }}
                                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm"
                            >
                                <h3 className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mb-3">Detected Vehicles</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-slate-900">{trafficStats.vehicleCount}</span>
                                    <span className="text-[0.65rem] font-bold text-indigo-500 uppercase tracking-tight">Active Nodes</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* AI Response */}
                    <div>
                        <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4 flex items-center gap-2">
                            <ClipboardList size={14} /> Response Matrix
                        </h2>

                        <AnimatePresence mode="wait">
                            {trafficStats.incidentPayload ? (
                                <div className="space-y-4">
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-800"
                                    >
                                        <h4 className="text-[0.6rem] font-bold text-indigo-400 uppercase tracking-[0.1em] mb-3">Live Payload</h4>
                                        <pre className="text-[0.7rem] text-slate-400 font-mono whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                                            {JSON.stringify(trafficStats.incidentPayload, null, 2)}
                                        </pre>
                                    </motion.div>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-slate-900 p-5 rounded-2xl shadow-lg border-l-4 border-indigo-500"
                                    >
                                        <h4 className="text-[0.6rem] font-bold text-slate-200 uppercase tracking-[0.1em] mb-3">AI Strategy</h4>
                                        <pre className="text-[0.7rem] text-slate-400 font-mono whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar">
                                            {JSON.stringify(trafficStats.recommendationPayload, null, 2)}
                                        </pre>
                                    </motion.div>
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4 items-center"
                                >
                                    <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-slate-100">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div className="text-sm font-semibold text-slate-500 italic">
                                        System optimized. No congestion detected.
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-[#F8FAFC]">
                <TrafficVideo onStatsUpdate={setTrafficStats} />
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f122; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f144; }
            `}</style>
        </div>
    );
}

export default Traffic;
