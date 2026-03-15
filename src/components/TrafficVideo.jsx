import React, { useRef, useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

const TrafficVideo = ({ onStatsUpdate }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, queue, processing, completed
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
                    if (res.status === 404) {
                        return; // Ignore missing job safely
                    }
                    const data = await res.json();
                    if (data.status === 'completed') {
                        setStatus('completed');
                        setResultsData(data.resultsData);
                    } else if (data.status) {
                        setStatus(data.status); // queue or processing
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

            // Set up local-only playback immediately!
            if (videoUrl) URL.revokeObjectURL(videoUrl); // cleanup
            setVideoUrl(URL.createObjectURL(selected));
            setResultsData([]); // Clear old boxes
            setStatus('idle');
            setJobId(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');

        // Create form data
        const formData = new FormData();
        formData.append('video', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setJobId(data.jobId);
            setStatus(data.status); // 'queue'
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    // The Animation Loop for Canvas
    const renderLoop = () => {
        if (!videoRef.current || !canvasRef.current || resultsData.length === 0) {
            requestRef.current = requestAnimationFrame(renderLoop);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!canvas) return; // Wait until rendered
        const ctx = canvas.getContext('2d');

        // Make canvas match video dimensions
        if (canvas.width !== video.clientWidth) {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sync boxes based on current time - ALWAYS find closest to prevent disappearance on pause!
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
            // Scale coordinates from original video to current display size
            const scaleX = canvas.width / video.videoWidth;
            const scaleY = canvas.height / video.videoHeight;

            // Draw Live Object Boxes
            currentFrame.boxes.forEach(box => {
                const x = box.x * scaleX;
                const y = box.y * scaleY;
                const w = box.w * scaleX;
                const h = box.h * scaleY;

                // 1. Transparent Red Fill inside the boundary
                ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
                ctx.fillRect(x, y, w, h);

                // 2. Solid Border
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);

                // 3. Polished Label (Background box + crisp text)
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

                    if (count > 7) { // HIGH
                        congestionLevel = 'HIGH';
                        incidentPayload = {
                            incident_type: "TRAFFIC_CONGESTION",
                            location: "Junction A",
                            severity: "HIGH",
                            timestamp: new Date().toLocaleTimeString()
                        };
                        recommendationPayload = {
                            alert: "Heavy congestion detected",
                            recommended_action: "Redirect emergency vehicles",
                            priority: "HIGH"
                        };
                    } else if (count > 3) { // MODERATE
                        congestionLevel = 'MODERATE';
                        incidentPayload = {
                            incident_type: "TRAFFIC_BUILDUP",
                            location: "Junction A",
                            severity: "MODERATE",
                            timestamp: new Date().toLocaleTimeString()
                        };
                        recommendationPayload = {
                            alert: "Traffic volume increasing",
                            recommended_action: "Monitor intersection flow",
                            priority: "MEDIUM"
                        };
                    }

                    // Dispatch updates back to the parent React Component (Sidebar)
                    onStatsUpdate({
                        vehicleCount: count,
                        congestionLevel,
                        incidentPayload,
                        recommendationPayload
                    });
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
        <div className="p-5 w-full flex flex-col">
            <h2 className="text-xl font-bold mb-2 text-dark-text">AI Traffic Video Tracking</h2>
            <p className="mb-5 text-slate-text">Upload a video to asynchronously track vehicles with YOLOv8.</p>

            <div className="flex gap-2.5 mb-5 items-center">
                <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*" 
                    onChange={handleFileChange}
                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-bg file:text-brand-blue hover:file:bg-slate-200"
                />
                <button 
                    onClick={handleUpload} 
                    disabled={!file || status === 'uploading' || status === 'queue' || status === 'processing'} 
                    className="px-4 py-2 bg-brand-blue text-white rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    Upload & Process
                </button>
            </div>

            <div className={`p-3 rounded-md mb-5 text-sm font-medium border ${
                status === 'completed' ? 'bg-green-50 border-green-200 text-green-800' :
                status === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
                <span className="font-bold">Status: </span>
                {status === 'idle' && 'Waiting.'}
                {status === 'uploading' && 'Uploading video to server...'}
                {status === 'queue' && 'In Queue. Waiting for Python worker...'}
                {status === 'processing' && 'Python AI is actively tracking vehicles... (this may take a minute)'}
                {status === 'completed' && 'Processing Complete! Ready to playback.'}
                {status === 'error' && 'An error occurred.'}
            </div>

            {status === 'completed' && videoUrl && (
                <div className="relative w-full max-w-[800px] bg-black rounded-lg overflow-hidden border border-border-subtle">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full block"
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
