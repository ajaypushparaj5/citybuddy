import React, { useState } from 'react';
import CityTwinEngine from './components/CityTwinEngine';
import Sidebar from './components/Sidebar';
import { fetchCityData } from './services/osmService';
import { fetchElevationGrid } from './services/elevationService';
import './index.css';

function App() {
  const [cityData, setCityData] = useState(null);
  const [elevationSamples, setElevation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showElevation, setShowElevation] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false);

  const handleCitySubmit = async (cityName) => {
    setIsLoading(true);
    setError(null);
    setElevation(null);
    try {
      // 1. Fetch city graph (roads, nodes, infrastructure)
      const data = await fetchCityData(cityName);
      setCityData(data);

      // 2. Fetch elevation grid in the background (non-blocking UX)
      //    We kick it off here and update state when it arrives
      fetchElevationGrid(data.bbox)
        .then(samples => setElevation(samples))
        .catch(err => console.warn('Elevation fetch failed (non-critical):', err.message));

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate city twin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        onSubmit={handleCitySubmit}
        isLoading={isLoading}
        error={error}
        cityData={cityData}
        showElevation={showElevation}
        setShowElevation={setShowElevation}
        showBuildings={showBuildings}
        setShowBuildings={setShowBuildings}
      />

      <div className="map-container">
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
          <CityTwinEngine data={cityData} elevationSamples={elevationSamples} showElevation={showElevation} showBuildings={showBuildings} />
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

export default App;
