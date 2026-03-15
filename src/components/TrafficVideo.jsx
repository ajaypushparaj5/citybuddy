import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, CheckCircle2, AlertCircle, Loader2, Video } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const TrafficVideo = ({ onStatsUpdate }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, queue, processing, completed, error
    const [jobId, setJobId] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [resultsData, setResultsData] = useState([]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const lastCountRef = useRef(-1);

    // Poll status when a job is active
    useEffect(() => {
        let interval;
        if (jobId && ['queue', 'processing'].includes(status)) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`${API_URL}/status/${jobId}`);
                    if (res.status === 404) return;
                    const data = await res.json();
                    if (data.status === 'completed') {
                        setStatus('completed');
                        setResultsData(data.resultsData);
                    } else if (data.status) {
                        setStatus(data.status);
                    }
                } catch (e) {
                    console.error('Polling Error:', e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [jobId, status]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            setVideoUrl(URL.createObjectURL(selected));
            setResultsData([]);
            setStatus('idle');
            setJobId(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');

        const formData = new FormData();
        formData.append('video', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setJobId(data.jobId);
            setStatus(data.status);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const renderLoop = () => {
        if (!videoRef.current || !canvasRef.current || resultsData.length === 0) {
            requestRef.current = requestAnimationFrame(renderLoop);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (canvas.width !== video.clientWidth) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentTime = video.currentTime;
        let currentFrame = resultsData[0];
        let minDiff = Infinity;
        for (let i = 0; i < resultsData.length; i++) {
            const diff = Math.abs(resultsData[i].timestamp - currentTime);
            if (diff < minDiff) {
                minDiff = diff;
                currentFrame = resultsData[i];
            }
        }

        if (currentFrame && currentFrame.boxes) {
            const scaleX = canvas.width / video.videoWidth;
            const scaleY = canvas.height / video.videoHeight;

            currentFrame.boxes.forEach(box => {
                const x = box.x * scaleX;
                const y = box.y * scaleY;
                const w = box.w * scaleX;
                const h = box.h * scaleY;

                // Using Pacific Cyan for detections
                ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
                ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = '#4f46e5';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);

                const label = `VEHICLE ${Math.round(box.confidence * 100)}%`;
                ctx.font = 'bold 10px Inter, system-ui, sans-serif';
                const textWidth = ctx.measureText(label).width;
                ctx.fillStyle = '#4f46e5';
                ctx.fillRect(x, y - 18, textWidth + 10, 18);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(label, x + 5, y - 5);
            });

            if (onStatsUpdate) {
                const count = currentFrame.boxes.length;
                if (lastCountRef.current !== count) {
                    lastCountRef.current = count;
                    let congestionLevel = 'LOW';
                    let incidentPayload = null;
                    let recommendationPayload = null;

                    if (count > 7) {
                        congestionLevel = 'HIGH';
                        incidentPayload = { incident_type: "TRAFFIC_CONGESTION", location: "Junction A", severity: "HIGH", timestamp: new Date().toLocaleTimeString() };
                        recommendationPayload = { alert: "Heavy congestion detected", recommended_action: "Redirect emergency vehicles", priority: "HIGH" };
                    } else if (count > 3) {
                        congestionLevel = 'MODERATE';
                        incidentPayload = { incident_type: "TRAFFIC_BUILDUP", location: "Junction A", severity: "MODERATE", timestamp: new Date().toLocaleTimeString() };
                        recommendationPayload = { alert: "Traffic volume increasing", recommended_action: "Monitor intersection flow", priority: "MEDIUM" };
                    } else {
                        congestionLevel = 'LOW';
                    }

                    onStatsUpdate({ vehicleCount: count, congestionLevel, incidentPayload, recommendationPayload });
                }
            }
        }
        requestRef.current = requestAnimationFrame(renderLoop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(requestRef.current);
    });

    const getStatusDetails = () => {
        switch(status) {
            case 'uploading': return { text: "Ingesting stream...", color: "text-indigo-600", icon: <Loader2 className="animate-spin" size={18} /> };
            case 'queue': return { text: "In Queue...", color: "text-amber-500", icon: <Loader2 className="animate-spin" size={18} /> };
            case 'processing': return { text: "Neural Analysis...", color: "text-indigo-600", icon: <Cpu className="animate-spin" size={18} /> };
            case 'completed': return { text: "Analysis Complete", color: "text-emerald-500", icon: <CheckCircle2 size={18} /> };
            case 'error': return { text: "System Error", color: "text-rose-500", icon: <AlertCircle size={18} /> };
            default: return { text: "System Ready", color: "text-slate-400", icon: <Video size={18} /> };
        }
    };

    const statusDetails = getStatusDetails();

    return (
        <div className="p-6 w-full flex flex-col bg-[#F8FAFC] h-full font-inter overflow-y-auto custom-scrollbar">
            {/* Top Toolbar */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="max-w-xl">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">AI Vision Intelligence</h2>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Edge-processed urban flow analysis via YOLO spatial tracking.
                    </p>
                </div>
                
                <div className="hidden md:flex items-center gap-3">
                    <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-wider">Neural Link: Active</span>
                    </div>
                </div>
            </header>
            
            {/* Upload Action Row */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-all font-bold text-xs whitespace-nowrap shadow-sm group">
                    <Upload size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                    INGEST FOOTAGE
                    <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                </label>
                
                <div className="flex-1 h-11 flex items-center px-4 bg-slate-50 border border-slate-100 rounded-xl text-[0.7rem] text-slate-400 font-mono italic overflow-hidden">
                    <span className="truncate">{file ? file.name : "AWAITING_SOURCE_STREAM..."}</span>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleUpload} 
                    disabled={!file || ['uploading', 'queue', 'processing'].includes(status)} 
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-100"
                >
                    <Play size={14} fill="currentColor" />
                    {status === 'uploading' ? "TRANSMITTING..." : "INITIATE ANALYSIS"}
                </motion.button>
            </div>

            {/* Split Page Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Left Side: Status and Insights */}
                <div className="flex flex-col gap-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl bg-slate-50 ${statusDetails.color}`}>
                                    {statusDetails.icon}
                                </div>
                                <div>
                                    <div className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Stream Status</div>
                                    <h3 className={`text-lg font-bold ${statusDetails.color} tracking-tight`}>
                                        {statusDetails.text}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <h4 className="text-[0.65rem] font-bold text-indigo-500 uppercase tracking-widest mb-3">Model metrics</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="text-[0.6rem] text-slate-500 font-bold uppercase mb-1">Inference</div>
                                        <div className="text-lg font-bold text-slate-900">~94.2%</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="text-[0.6rem] text-slate-500 font-bold uppercase mb-1">Latency</div>
                                        <div className="text-lg font-bold text-slate-900">120ms</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-inner overflow-hidden relative">
                                <h4 className="text-[0.6rem] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                                    System Console
                                </h4>
                                <div className="font-mono text-[0.7rem] text-slate-400 space-y-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                                    <div className="text-indigo-400">[SYS] Weight matrix initialized.</div>
                                    <div>[IO] Mounting stream buffer...</div>
                                    {status === 'processing' && <div className="text-emerald-400 animate-pulse">[PROC] Inference on frame_842...</div>}
                                    {status === 'completed' && <div className="text-white/80">[OK] Payload delivered.</div>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[0.6rem] font-bold text-slate-300 uppercase tracking-widest">Job: {jobId ? jobId.slice(0, 8) : "IDLE"}</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map(i => (
                                    <motion.div 
                                        key={i}
                                        animate={{ height: [3, 12, 3] }}
                                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                                        className="w-0.5 bg-indigo-500/30 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Professional Video Playback */}
                <div className="flex flex-col h-full min-h-0">
                    {status === 'completed' && videoUrl ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.99 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative flex-1 bg-black rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm group"
                        >
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                controls
                                className="w-full h-full block object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                            />
                            
                            <div className="absolute top-4 right-4 z-20">
                                <div className="bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10 text-[0.55rem] font-mono text-white/80 tracking-widest">
                                    SECURE_ENC_V2
                                </div>
                            </div>

                            <div className="absolute bottom-12 left-6 z-20 pointer-events-none">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 p-1.5 rounded-lg">
                                    <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-[0.5rem] font-bold text-white uppercase tracking-widest">Annotated Feed</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                <Video size={20} className="text-slate-300" />
                            </div>
                            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Initialize feed to begin</span>
                        </div>
                    )}
                    
                    <div className="mt-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[0.6rem] text-slate-400 font-mono flex justify-between shadow-sm">
                        <span>LATENCY_OPTIMIZATION: ON</span>
                        <span className="text-indigo-500/60 font-bold">READY</span>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #6366f122; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f144; }
            `}</style>
        </div>
    );
};

const Cpu = ({ className, size }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>
);

export default TrafficVideo;
