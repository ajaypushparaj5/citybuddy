// Data Integration Service
// Simulates / Streams real-time smart city data ticks (Traffic, Weather, IoT Sensors)

class DataIntegrationService {
    constructor() {
        this.subscribers = new Set();
        this.interval = null;
        this.tickRate = 5000; // 5 seconds per tick
        this.cityBbox = null;
        this.cityEdges = [];
        this.areaConfig = { bbox: null, params: { rainfall: 0, trafficDensity: 0 } };
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

        const tickData = {
            timestamp: Date.now(),
            weather: this.generateWeather(),
            traffic: this.generateTraffic(),
            sensors: this.generateSensors(),
            areaConfig: this.areaConfig,
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

