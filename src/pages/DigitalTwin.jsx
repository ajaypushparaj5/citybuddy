import React, { useState } from 'react';
import CityTwinEngine from '../components/CityTwinEngine';
import Sidebar from '../components/Sidebar';
import { fetchCityData } from '../services/osmService';
import { fetchElevationGrid } from '../services/elevationService';
import { dataIntegrationService } from '../services/dataIntegrationService';
import { agentManager } from '../agents/CityAgentManager';

function DigitalTwin() {
  const [cityData, setCityData] = useState(null);
  const [elevationSamples, setElevation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showElevation, setShowElevation] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [sensorData, setSensorData] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  const [areaParams, setAreaParams] = useState({
    // Weather
    rainfall: 0, windSpeed: 0, temperature: 22, fog: 0, earthquake: 0,
    // Transport
    trafficDensity: 0, roadClosure: false, publicTransportFailure: false, accidentRate: 0,
    // Infrastructure
    powerGridLoad: 50, powerOutage: false, waterPressure: 100, cellTowerCongestion: 0,
    // Population
    crowdDensity: 0, publicEvent: false, evacuationOrder: false,
    // Crisis
    fireRisk: 0, chemicalSpill: false, airQuality: 50
  });

  const [resourceBudget, setResourceBudget] = useState({
    ambulances: 50,
    fireTrucks: 20,
    policeUnits: 100,
    medicalPersonnel: 200,
    helicopters: 2,
    volunteers: 500,
    cityBudgetMil: 5
  });

  const [agentStates, setAgentStates] = useState([]);

  const handleCitySubmit = async (cityName) => {
    setIsLoading(true);
    setError(null);
    setElevation(null);
    try {
      // 1. Fetch city graph (roads, nodes, infrastructure)
      const data = await fetchCityData(cityName);
      setCityData(data);

      // 2. Fetch elevation grid in the background (non-blocking UX)
      fetchElevationGrid(cityName, data.bbox)
        .then(samples => setElevation(samples))
        .catch(err => console.warn('Elevation fetch failed (non-critical):', err.message));

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate city twin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start data stream when city data is loaded
  React.useEffect(() => {
    if (cityData) {
      // Initialize agent manager with data and alert handler
      agentManager.init(cityData, (alert) => {
        setActiveAlerts(prev => [alert, ...prev].slice(0, 50));
      });

      // Start data service
      dataIntegrationService.start(cityData.bbox, cityData.edges);

      // Subscribe to updates
      const unsubscribe = dataIntegrationService.subscribe((tick) => {
        setSensorData(tick);
        agentManager.processTick(tick);
        setAgentStates(agentManager.getAgentStates());
      });

      return () => {
        unsubscribe();
        dataIntegrationService.stop();
      };
    }
  }, [cityData]);

  // Sync area parameters to data service
  React.useEffect(() => {
    if (cityData) {
      dataIntegrationService.updateAreaConfig({
        bbox: selectedArea,
        params: areaParams,
        resources: resourceBudget
      });
    }
  }, [selectedArea, areaParams, resourceBudget, cityData]);

  return (
    <div className="twin-page-container" style={{ display: 'flex', height: 'calc(100vh - 54px)', width: '100%', overflow: 'hidden' }}>
      <Sidebar
        onSubmit={handleCitySubmit}
        isLoading={isLoading}
        error={error}
        cityData={cityData}
        showElevation={showElevation}
        setShowElevation={setShowElevation}
        showBuildings={showBuildings}
        setShowBuildings={setShowBuildings}
        activeAlerts={activeAlerts}
        sensorData={sensorData}
        selectedArea={selectedArea}
        areaParams={areaParams}
        setAreaParams={setAreaParams}
        resourceBudget={resourceBudget}
        setResourceBudget={setResourceBudget}
        agentStates={agentStates}
        elevationSamples={elevationSamples}
      />

      <div className="map-container" style={{ flex: 1, position: 'relative', height: '100%' }}>
        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(248, 250, 252, 0.8)', zIndex: 50
          }}>
            <div style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Extracting Infrastructure...</div>
          </div>
        )}

        {cityData ? (
          <CityTwinEngine
            data={cityData}
            elevationSamples={elevationSamples}
            showElevation={showElevation}
            showBuildings={showBuildings}
            sensorData={sensorData}
            activeAlerts={activeAlerts}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
          />
        ) : (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text-secondary)'
          }}>
            <p>Select a region to generate a Digital Twin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DigitalTwin;
