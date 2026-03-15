import React, { useState } from 'react';
import CityTwinEngine from '../components/CityTwinEngine';
import Sidebar from '../components/Sidebar';
import { fetchCityData } from '../services/osmService';

function DigitalTwin() {
  const [cityData, setCityData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCitySubmit = async (cityName) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Fetching data for ${cityName}...`);
      const data = await fetchCityData(cityName);
      console.log('City Data Extracted:', data);
      setCityData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate city twin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-screen overflow-hidden">
      <Sidebar
        onSubmit={handleCitySubmit}
        isLoading={isLoading}
        error={error}
        cityData={cityData}
      />

      <div className="flex-1 relative bg-slate-200 overflow-y-auto overflow-x-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-bg/80 z-50">
            <div className="text-brand-blue font-semibold">Extracting Infrastructure...</div>
          </div>
        )}

        {cityData ? (
          <CityTwinEngine data={cityData} />
        ) : (
          <div className="h-full flex items-center justify-center text-text-secondary">
            <p>Select a region to generate a Digital Twin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DigitalTwin;
