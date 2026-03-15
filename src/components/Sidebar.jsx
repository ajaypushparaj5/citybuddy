import React, { useState } from 'react';

const Sidebar = ({ onSubmit, isLoading, error, cityData }) => {
    const [cityName, setCityName] = useState('New York, NY');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cityName.trim() && !isLoading) {
            onSubmit(cityName);
        }
    };

    return (
        <div className="w-[400px] bg-white-bg border-r border-subtle-border shadow-sm flex flex-col z-10 h-full">
            <div className="p-6 border-b border-subtle-border">
                <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-dark-text">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-boxes"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg>
                    AI-CityEngine
                </h1>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-slate-text" htmlFor="city-input">Select Region / City</label>
                        <input
                            id="city-input"
                            className="w-full px-4 py-3 border border-subtle-border rounded-lg text-sm bg-white-bg transition-all duration-200 font-[inherit] text-dark-text focus:outline-none focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
                            type="text"
                            placeholder="e.g. San Francisco, CA"
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-brand-blue text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        disabled={isLoading || !cityName.trim()}
                    >
                        {isLoading ? 'Generating Twin...' : 'Generate Digital Twin'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 text-brand-red text-sm p-3 bg-red-50 rounded-lg border border-red-200">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {cityData && (
                    <div className="mt-8">
                        <h2 className="text-base font-semibold mb-4 border-b border-subtle-border pb-2 text-dark-text">Twin Status</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white border border-subtle-border rounded-lg p-4 shadow-sm">
                                <h3 className="text-[0.75rem] uppercase tracking-wider text-slate-text mb-2 font-medium">Nodes</h3>
                                <div className="text-2xl font-bold text-dark-text">{cityData.nodes?.length || 0}</div>
                            </div>
                            <div className="bg-white border border-subtle-border rounded-lg p-4 shadow-sm">
                                <h3 className="text-[0.75rem] uppercase tracking-wider text-slate-text mb-2 font-medium">Edges</h3>
                                <div className="text-2xl font-bold text-dark-text">{cityData.edges?.length || 0}</div>
                            </div>
                            <div className="bg-white border border-subtle-border rounded-lg p-4 shadow-sm">
                                <h3 className="text-[0.75rem] uppercase tracking-wider text-slate-text mb-2 font-medium">Hospitals</h3>
                                <div className="text-2xl font-bold text-dark-text">{cityData.infrastructure?.hospitals || 0}</div>
                            </div>
                            <div className="bg-white border border-subtle-border rounded-lg p-4 shadow-sm">
                                <h3 className="text-[0.75rem] uppercase tracking-wider text-slate-text mb-2 font-medium">Police / Fire</h3>
                                <div className="text-2xl font-bold text-dark-text">{cityData.infrastructure?.emergency || 0}</div>
                            </div>
                        </div>

                        <p className="mt-4 text-[0.75rem] text-slate-text">
                            Center: {cityData.center[1].toFixed(4)}, {cityData.center[0].toFixed(4)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
