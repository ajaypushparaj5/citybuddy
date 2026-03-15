import React, { useState } from 'react';
import TrafficVideo from '../components/TrafficVideo';

function Traffic() {
    const [trafficStats, setTrafficStats] = useState({
        vehicleCount: 0,
        congestionLevel: '-',
        incidentPayload: null,
        recommendationPayload: null
    });

    return (
        <div className="flex h-full w-screen overflow-hidden">
            <div className="w-[400px] bg-white-bg border-r border-subtle-border shadow-sm flex flex-col z-10 h-full overflow-y-auto">
                <div className="p-5 text-slate-text">
                    <h3 className="mb-2.5 text-dark-text">Traffic AI Tracking</h3>
                    <p className="text-sm leading-6 mb-5">
                        Upload your traffic camera footage on the right to asynchronously process it through the Python YOLO model.
                    </p>

                    <h2 className="text-base font-semibold mb-4 border-b border-subtle-border pb-2 text-dark-text">Live Tracking Analysis</h2>
                    <div className="flex flex-col gap-3">
                        <div className={`p-4 border rounded-lg ${
                            trafficStats.congestionLevel === 'HIGH' ? 'bg-red-100 border-red-200' : 
                            trafficStats.congestionLevel === 'MODERATE' ? 'bg-amber-100 border-amber-200' : 
                            trafficStats.congestionLevel === 'LOW' ? 'bg-green-100 border-green-200' : 'bg-slate-100 border-slate-200'
                        }`}>
                            <h3 className={`text-xs uppercase tracking-wider mb-2 font-medium ${
                                trafficStats.congestionLevel === 'HIGH' ? 'text-red-800' : 
                                trafficStats.congestionLevel === 'MODERATE' ? 'text-amber-800' : 
                                trafficStats.congestionLevel === 'LOW' ? 'text-green-800' : 'text-slate-text'
                            }`}>Live Congestion</h3>
                            <div className={`text-2xl font-bold ${
                                trafficStats.congestionLevel === 'HIGH' ? 'text-red-800' : 
                                trafficStats.congestionLevel === 'MODERATE' ? 'text-amber-800' : 
                                trafficStats.congestionLevel === 'LOW' ? 'text-green-800' : 'text-dark-text'
                            }`}>
                                {trafficStats.congestionLevel}
                            </div>
                        </div>

                        <div className="bg-white border border-subtle-border rounded-lg p-4 shadow-sm">
                            <h3 className="text-xs uppercase tracking-wider text-slate-text mb-2 font-medium">Vehicles Detected</h3>
                            <div className="text-2xl font-bold text-dark-text">{trafficStats.vehicleCount}</div>
                        </div>
                    </div>

                    <h2 className="text-base font-semibold mt-8 mb-4 border-b border-subtle-border pb-2 text-dark-text">AI Response Agent</h2>
                    <div className="flex flex-col gap-3">

                        {trafficStats.incidentPayload ? (
                            <>
                                <div className="bg-slate-800 text-sky-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
                                    <h4 className="text-slate-400 text-[0.7rem] mb-2.5 uppercase tracking-widest">Event Output</h4>
                                    <pre className="m-0 whitespace-pre-wrap">
                                        {JSON.stringify(trafficStats.incidentPayload, null, 2)}
                                    </pre>
                                </div>

                                <div className="bg-slate-800 text-emerald-400 p-4 rounded-md font-mono text-xs overflow-x-auto mt-2.5">
                                    <h4 className="text-slate-400 text-[0.7rem] mb-2.5 uppercase tracking-widest">Decision Matrix Output</h4>
                                    <pre className="m-0 whitespace-pre-wrap">
                                        {JSON.stringify(trafficStats.recommendationPayload, null, 2)}
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-sm text-green-800 font-medium">
                                    System is operating normally. Traffic flow is within acceptable margins.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 relative bg-slate-200 overflow-y-auto overflow-x-hidden">
                <TrafficVideo onStatsUpdate={setTrafficStats} />
            </div>
        </div>
    );
}

export default Traffic;
