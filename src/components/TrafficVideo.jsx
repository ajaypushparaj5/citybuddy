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
        <div style={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2>AI Traffic Video Tracking</h2>
            <p style={{ marginBottom: '20px' }}>Upload a video to asynchronously track vehicles with YOLOv8.</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={handleFileChange} />
                <button onClick={handleUpload} disabled={!file || status === 'uploading' || status === 'queue' || status === 'processing'} style={{ padding: '8px 16px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Upload & Process
                </button>
            </div>

            <div style={{ background: '#e2e8f0', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                <strong>Status: </strong>
                {status === 'idle' && 'Waiting.'}
                {status === 'uploading' && 'Uploading video to server...'}
                {status === 'queue' && 'In Queue. Waiting for Python worker...'}
                {status === 'processing' && 'Python AI is actively tracking vehicles... (this may take a minute)'}
                {status === 'completed' && 'Processing Complete! Ready to playback.'}
                {status === 'error' && 'An error occurred.'}
            </div>

            {status === 'completed' && videoUrl && (
                <div style={{ position: 'relative', width: '100%', maxWidth: '800px', backgroundColor: 'black', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        style={{ width: '100%', display: 'block' }}
                    />
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            pointerEvents: 'none'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default TrafficVideo;
