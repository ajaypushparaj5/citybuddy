import React, { useRef, useState, useEffect } from 'react';

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

                ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
                ctx.fillRect(x, y, w, h);
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);

                const label = `VEHICLE ${Math.round(box.confidence * 100)}%`;
                ctx.font = '600 11px Inter, system-ui, sans-serif';
                const textWidth = ctx.measureText(label).width;
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x, y - 18, textWidth + 8, 18);
                ctx.fillStyle = '#ffffff';
                ctx.fillText(label, x + 4, y - 5);
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

    return (
        <div className="p-10 w-full flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-text-primary">AI Traffic Video Tracking</h2>
            <p className="mb-8 text-text-secondary max-w-2xl">Upload city traffic camera footage to monitor congestion and detect incidents in real-time with YOLO intelligence.</p>
            
            <div className="flex items-center gap-4 mb-10">
                <label className="px-6 py-3 bg-accent-blue text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 font-medium">
                    Choose Video File
                    <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                </label>
                <div className="flex-1 px-4 py-3 bg-bg-primary border border-border-subtle rounded-xl text-sm text-text-secondary italic">
                    {file ? file.name : "Waiting for footage selection..."}
                </div>
                <button 
                    onClick={handleUpload} 
                    disabled={!file || ['uploading', 'queue', 'processing'].includes(status)} 
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-black disabled:bg-slate-300 disabled:cursor-not-allowed transition-all font-bold"
                >
                    {status === 'uploading' ? "Uploading..." : "Analyze Stream"}
                </button>
            </div>

            <div className={`p-6 rounded-2xl mb-10 border transition-all duration-500 ${
                status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                status === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
                'bg-bg-primary border-border-subtle text-text-primary'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                        status === 'completed' ? 'bg-emerald-500' :
                        status === 'error' ? 'bg-red-500' :
                        status === 'idle' ? 'bg-slate-300 animate-none' : 'bg-accent-blue'
                    }`} />
                    <span className="font-bold uppercase tracking-[0.1em] text-xs">System Status</span>
                </div>
                <p className="mt-3 text-lg font-medium opacity-90">
                    {status === 'idle' && 'System initialized. Ready for data ingestion.'}
                    {status === 'uploading' && 'Ingesting video stream to processing cluster...'}
                    {status === 'queue' && 'In Queue. Waiting for AI compute resources...'}
                    {status === 'processing' && 'Neural network is actively analyzing traffic patterns...'}
                    {status === 'completed' && 'Analysis Complete. Digital Twin data synced.'}
                    {status === 'error' && 'Critical Error: Data packet transmission failed.'}
                </p>
            </div>

            {status === 'completed' && videoUrl && (
                <div className="relative w-full max-w-[900px] aspect-video bg-black rounded-3xl overflow-hidden border border-border-subtle shadow-2xl">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                </div>
            )}
        </div>
    );
};

export default TrafficVideo;
