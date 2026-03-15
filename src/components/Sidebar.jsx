import React, { useState } from 'react';
import ActionPlanModal from './ActionPlanModal';

const Sidebar = ({
    onSubmit,
    isLoading,
    error,
    cityData,
    showElevation,
    setShowElevation,
    showBuildings,
    setShowBuildings,
    activeAlerts = [],
    sensorData = null,
    selectedArea = null,
    areaParams = { rainfall: 0, trafficDensity: 0 },
    setAreaParams,
    resourceBudget = {
        ambulances: 50,
        fireTrucks: 20,
        policeUnits: 100,
        medicalPersonnel: 200,
        helicopters: 2,
        volunteers: 500,
        cityBudgetMil: 5
    },
    setResourceBudget,
    agentStates = [],
    elevationSamples = null,
    onRunScenario,
    onResetArea,
}) => {

    const [cityName, setCityName] = useState('New York, NY');
    const [activeAgentTab, setActiveAgentTab] = useState(null);
    const [selectedAlertForPlan, setSelectedAlertForPlan] = useState(null);

    const updateResource = (key, delta) => {
        if (!setResourceBudget) return;

        setResourceBudget(prev => ({
            ...prev,
            [key]: Math.max(0, prev[key] + delta)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cityName.trim() && !isLoading) {
            onSubmit(cityName);
        }
    };

    return (
        <>
            <div className="w-[400px] h-full flex flex-col shrink-0 border-r border-slate-200 bg-[#E2EDED]/60 backdrop-blur-xl shadow-xl">

                {/* HEADER */}

                <div className="p-6 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#55A2B2] to-[#1B899D] text-white font-bold">
                        AI
                    </div>

                    <h1 className="text-lg font-semibold text-[#26302B] tracking-tight">
                        AI-CityEngine
                    </h1>
                </div>


                {/* CONTENT */}

                <div className="p-6 flex-1 overflow-y-auto">

                    {/* CITY INPUT */}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="text-xs font-semibold text-[#26302B] mb-2 block">
                                Select Region / City
                            </label>

                            <input
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1B899D]"
                                type="text"
                                placeholder="e.g. San Francisco, CA"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>


                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[#55A2B2] to-[#1B899D] hover:opacity-90 transition disabled:opacity-40"
                            disabled={isLoading || !cityName.trim()}
                        >
                            {isLoading ? 'Generating Twin...' : 'Generate Digital Twin'}
                        </button>

                    </form>


                    {error && (
                        <div className="mt-4 p-3 text-sm rounded-lg bg-red-100 text-red-600">
                            {error}
                        </div>
                    )}



                    {/* AREA SIMULATION */}

                    {selectedArea && (

                        <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">

                            <div className="flex justify-between mb-3">
                                <h2 className="text-sm font-semibold text-[#26302B]">
                                    Area Simulation
                                </h2>

                                <button
                                    onClick={onResetArea}
                                    className="text-xs text-slate-500 hover:text-slate-700"
                                >
                                    Reset
                                </button>
                            </div>


                            {/* Rainfall */}

                            <div className="mb-4">
                                <label className="text-xs flex justify-between text-slate-600 mb-1">
                                    Rainfall
                                    <span>{(areaParams.rainfall * 100).toFixed(0)}%</span>
                                </label>

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={areaParams.rainfall}
                                    onChange={(e) =>
                                        setAreaParams({
                                            ...areaParams,
                                            rainfall: parseFloat(e.target.value)
                                        })
                                    }
                                    className="w-full accent-[#1B899D]"
                                />
                            </div>


                            {/* Traffic */}

                            <div className="mb-4">
                                <label className="text-xs flex justify-between text-slate-600 mb-1">
                                    Traffic Density
                                    <span>{(areaParams.trafficDensity * 100).toFixed(0)}%</span>
                                </label>

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={areaParams.trafficDensity}
                                    onChange={(e) =>
                                        setAreaParams({
                                            ...areaParams,
                                            trafficDensity: parseFloat(e.target.value)
                                        })
                                    }
                                    className="w-full accent-[#55A2B2]"
                                />
                            </div>


                            {/* RESOURCES */}

                            <div className="mt-6">

                                <h3 className="text-sm font-semibold text-[#26302B] mb-3">
                                    City Resources
                                </h3>

                                <div className="space-y-2">

                                    {[
                                        { key: 'ambulances', label: 'Ambulances', step: 5 },
                                        { key: 'fireTrucks', label: 'Fire Trucks', step: 2 },
                                        { key: 'policeUnits', label: 'Police Units', step: 10 },
                                        { key: 'medicalPersonnel', label: 'Med Staff', step: 20 },
                                    ].map(({ key, label, step }) => (

                                        <div
                                            key={key}
                                            className="flex justify-between items-center bg-[#E2EDED] rounded-lg px-3 py-2"
                                        >

                                            <span className="text-xs font-medium text-[#26302B]">
                                                {label}
                                            </span>

                                            <div className="flex items-center gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() => updateResource(key, -step)}
                                                    className="w-6 h-6 rounded-md bg-white border border-slate-200 text-sm"
                                                >
                                                    -
                                                </button>

                                                <span className="text-xs font-semibold w-8 text-center">
                                                    {resourceBudget[key]}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => updateResource(key, step)}
                                                    className="w-6 h-6 rounded-md bg-white border border-slate-200 text-sm"
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>
                                    ))}

                                </div>

                            </div>



                            <button
                                onClick={onRunScenario}
                                className="w-full mt-5 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[#55A2B2] to-[#1B899D] hover:opacity-90 transition"
                            >
                                Run Scenario
                            </button>

                        </div>

                    )}



                    {/* TOGGLES */}

                    {cityData && (

                        <div className="mt-6 space-y-3 text-sm">

                            <label className="flex items-center gap-2 text-[#26302B]">
                                <input
                                    type="checkbox"
                                    checked={showElevation}
                                    onChange={(e) => setShowElevation(e.target.checked)}
                                    className="accent-[#1B899D]"
                                />
                                Terrain Elevation
                            </label>

                            <label className="flex items-center gap-2 text-[#26302B]">
                                <input
                                    type="checkbox"
                                    checked={showBuildings}
                                    onChange={(e) => setShowBuildings(e.target.checked)}
                                    className="accent-[#1B899D]"
                                />
                                Buildings
                            </label>

                        </div>

                    )}



                    {/* AGENT SWARM */}

                    {cityData && (

                        <div className="mt-8">

                            <h2 className="text-sm font-semibold text-[#26302B] mb-3">
                                Multi-Agent Swarm
                            </h2>


                            <div className="grid grid-cols-2 gap-2">

                                {agentStates.map(agent => (

                                    <div
                                        key={agent.name}
                                        onClick={() =>
                                            setActiveAgentTab(
                                                activeAgentTab === agent.name
                                                    ? null
                                                    : agent.name
                                            )
                                        }
                                        className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition"
                                    >

                                        <div className="text-xs font-semibold text-[#26302B] truncate">
                                            {agent.name.replace('Agent', '')}
                                        </div>

                                        <div className="text-[10px] text-slate-500 mt-1 capitalize">
                                            {agent.status}
                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                </div>

            </div>


            {selectedAlertForPlan && (
                <ActionPlanModal
                    alert={selectedAlertForPlan}
                    cityData={cityData}
                    sensorData={sensorData}
                    elevationSamples={elevationSamples}
                    onClose={() => setSelectedAlertForPlan(null)}
                />
            )}

        </>
    );
};

export default Sidebar;