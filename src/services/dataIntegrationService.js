// Data Integration Service
// Simulates / Streams real-time smart city data ticks (Traffic, Weather, IoT Sensors)

class DataIntegrationService {
    constructor() {
        this.subscribers = new Set();
        this.interval = null;
        this.tickRate = 5000; // 5 seconds per tick
        this.cityBbox = null;
        this.cityEdges = [];
        this.areaConfig = {
            bbox: null,
            params: { rainfall: 0, trafficDensity: 0 },
            resources: { ambulances: 50, fireTrucks: 20, policeUnits: 100, medicalPersonnel: 200, helicopters: 2, volunteers: 500, cityBudgetMil: 5 }
        };
        this.manualSensorsQueue = [];
    }

    start(bbox, edges) {
        this.cityBbox = bbox;
        this.cityEdges = edges;
        this.manualSensorsQueue = [];
        this.stop();
        this.interval = setInterval(() => this.tick(), this.tickRate);
        console.log("[DataIntegrationService] Started data streaming ticks.");
    }

    updateAreaConfig(config) {
        this.areaConfig = config;
    }

    injectAnomaly(sensor) {
        this.manualSensorsQueue.push(sensor);
        // Force an immediate tick for responsiveness
        this.tick();
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    tick() {
        let currentSensors = this.generateSensors();

        // Add manual citizen reports and clear queue
        if (this.manualSensorsQueue.length > 0) {
            currentSensors = [...currentSensors, ...this.manualSensorsQueue];
            this.manualSensorsQueue = [];
        }

        const weatherData = this.generateWeather();
        const trafficData = this.generateTraffic();

        // Filter and expose ONLY abnormal conditions to save LLM tokens and trigger targeted analysis
        const abnormalConditions = [];
        const p = this.areaConfig.params;

        // 1. Weather & Earth
        if (p.windSpeed > 40) abnormalConditions.push({ type: 'weather_wind', severity: p.windSpeed > 80 ? 'high' : 'medium', value: p.windSpeed, unit: 'km/h', desc: 'High wind speed' });
        if (p.temperature > 32) abnormalConditions.push({ type: 'weather_heat', severity: p.temperature > 40 ? 'high' : 'medium', value: p.temperature, unit: 'C', desc: 'Extreme heat' });
        if (p.temperature < 0) abnormalConditions.push({ type: 'weather_cold', severity: p.temperature < -10 ? 'high' : 'medium', value: p.temperature, unit: 'C', desc: 'Freezing temperatures' });
        if (p.fog > 0.4) abnormalConditions.push({ type: 'weather_fog', severity: p.fog > 0.8 ? 'high' : 'medium', value: p.fog, unit: 'index', desc: 'Low visibility fog' });
        if (p.earthquake > 3.0) abnormalConditions.push({ type: 'crisis_earthquake', severity: p.earthquake > 6.0 ? 'high' : 'medium', value: p.earthquake, unit: 'Magnitude', desc: 'Earthquake detected' });
        if (p.rainfall > 0.3) abnormalConditions.push({ type: 'weather_rain', severity: p.rainfall > 0.7 ? 'high' : 'medium', value: p.rainfall, unit: 'index', desc: 'Heavy sustained rainfall' });

        // 2. Transport & Traffic
        if (p.roadClosure) abnormalConditions.push({ type: 'transport_road_closure', severity: 'high', desc: 'Major road closure active' });
        if (p.publicTransportFailure) abnormalConditions.push({ type: 'transport_transit_failure', severity: 'high', desc: 'Public transit network failure' });
        if (p.accidentRate > 0.4) abnormalConditions.push({ type: 'transport_high_accidents', severity: p.accidentRate > 0.7 ? 'high' : 'medium', desc: 'Elevated accident rate' });
        if (p.trafficDensity > 0.7) abnormalConditions.push({ type: 'transport_congestion', severity: p.trafficDensity > 0.9 ? 'high' : 'medium', desc: 'Severe traffic congestion' });

        // 3. Infrastructure & Grid
        if (p.powerGridLoad > 85) abnormalConditions.push({ type: 'infra_grid_overload', severity: p.powerGridLoad > 105 ? 'high' : 'medium', value: p.powerGridLoad, unit: '%', desc: 'Power grid nearing capacity' });
        if (p.powerOutage) abnormalConditions.push({ type: 'infra_power_outage', severity: 'high', desc: 'Active blackout' });
        if (p.waterPressure < 50) abnormalConditions.push({ type: 'infra_low_water_pressure', severity: p.waterPressure < 20 ? 'high' : 'medium', value: p.waterPressure, unit: '%', desc: 'Low water pressure' });
        if (p.cellTowerCongestion > 0.7) abnormalConditions.push({ type: 'infra_comms_congestion', severity: p.cellTowerCongestion > 0.9 ? 'high' : 'medium', desc: 'Cellular network congested' });

        // 4. Population & Public
        if (p.crowdDensity > 0.7) abnormalConditions.push({ type: 'pop_crowd_crush', severity: p.crowdDensity > 0.9 ? 'high' : 'medium', value: p.crowdDensity, unit: 'density', desc: 'Dangerous crowd density' });
        if (p.publicEvent) abnormalConditions.push({ type: 'pop_public_event', severity: 'medium', desc: 'Major public event active' });
        if (p.evacuationOrder) abnormalConditions.push({ type: 'pop_evacuation', severity: 'high', desc: 'Active evacuation order' });

        // 5. Crisis Scenarios
        if (p.fireRisk > 0.6) abnormalConditions.push({ type: 'crisis_fire_risk', severity: p.fireRisk > 0.85 ? 'high' : 'medium', value: p.fireRisk, unit: 'index', desc: 'High fire spread risk' });
        if (p.chemicalSpill) abnormalConditions.push({ type: 'crisis_chemical_spill', severity: 'high', desc: 'Hazardous material spill' });
        if (p.airQuality > 100) abnormalConditions.push({ type: 'crisis_poor_aqi', severity: p.airQuality > 200 ? 'high' : 'medium', value: p.airQuality, unit: 'AQI', desc: 'Hazardous air quality' });
        const tickData = {
            timestamp: Date.now(),
            weather: weatherData,
            traffic: trafficData,
            sensors: currentSensors,
            areaConfig: this.areaConfig,
            abnormalConditions: abnormalConditions
        };

        this.subscribers.forEach(cb => cb(tickData));
    }

    generateWeather() {
        // Mock weather baseline
        let rainfall = Math.random() > 0.8 ? Math.random() * 10 : 0;

        // Boost if within the high-rainfall area config
        if (this.areaConfig.params.rainfall > 0) {
            rainfall = Math.max(rainfall, this.areaConfig.params.rainfall * 100);
        }

        return {
            temp: 22 + (Math.random() * 5 - 2.5),
            rainfall: rainfall,
            condition: rainfall > 5 ? 'Stormy' : 'Cloudy'
        };
    }

    generateTraffic() {
        const congested = [];
        const trafficDensity = this.areaConfig.params.trafficDensity || 0;

        // Nothing configured — return no congestion. Selecting a box alone should not show any traffic.
        if (trafficDensity === 0) return congested;

        const baseCount = Math.floor(Math.random() * 5) + 3;
        const count = baseCount + Math.floor(trafficDensity * 20);

        // Only prefer local edges when an area bbox is also selected
        let localEdges = [];
        if (this.areaConfig.bbox) {
            const [[boxS, boxW], [boxN, boxE]] = this.areaConfig.bbox;
            localEdges = this.cityEdges.filter(edge =>
                edge.source.lat >= boxS && edge.source.lat <= boxN &&
                edge.source.lon >= boxW && edge.source.lon <= boxE
            );
        }

        for (let i = 0; i < count; i++) {
            let edge;
            if (localEdges.length > 0 && Math.random() < 0.8) {
                edge = localEdges[Math.floor(Math.random() * localEdges.length)];
            }
            if (!edge) edge = this.cityEdges[Math.floor(Math.random() * this.cityEdges.length)];

            if (edge) {
                const level = Math.random() > (0.7 - trafficDensity * 0.5) ? 'heavy' : 'moderate';
                congested.push({ edgeId: edge.id, level, speed: 15 + Math.random() * 20 });
            }
        }
        return congested;
    }

    generateSensors() {
        const sensors = [];
        // Random accident pulse
        if (Math.random() > 0.95 && this.cityEdges.length > 0) {
            const edge = this.cityEdges[Math.floor(Math.random() * this.cityEdges.length)];
            sensors.push({
                type: 'accident',
                lat: (edge.source.lat + edge.target.lat) / 2,
                lon: (edge.source.lon + edge.target.lon) / 2,
                severity: 'high'
            });
        }

        // Random water level pulse (if rainfall is high)
        if (Math.random() > 0.9 && this.cityBbox) {
            const [[south, west], [north, east]] = this.cityBbox;
            sensors.push({
                type: 'flood_sensor',
                lat: south + Math.random() * (north - south),
                lon: west + Math.random() * (east - west),
                value: 0.5 + Math.random() * 2.5,
                alert: true
            });
        }

        return sensors;
    }
}

export const dataIntegrationService = new DataIntegrationService();

