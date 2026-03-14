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
    }

    start(bbox, edges) {
        this.cityBbox = bbox;
        this.cityEdges = edges;
        this.stop();
        this.interval = setInterval(() => this.tick(), this.tickRate);
        console.log("[DataIntegrationService] Started data streaming ticks.");
    }

    updateAreaConfig(config) {
        this.areaConfig = config;
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
        const tickData = {
            timestamp: Date.now(),
            weather: this.generateWeather(),
            traffic: this.generateTraffic(),
            sensors: this.generateSensors()
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
        // Pick 5-10 random edges to apply "congestion" to
        const congested = [];
        const baseCount = Math.floor(Math.random() * 5) + 3;
        const count = baseCount + Math.floor(this.areaConfig.params.trafficDensity * 20);
        
        for(let i=0; i<count; i++) {
            // Priority: half the extra traffic goes to the specific selected area if it exists
            let edge;
            if (this.areaConfig.bbox && Math.random() < 0.8) {
                const [[s, w], [n, e]] = this.areaConfig.bbox;
                const localEdges = this.cityEdges.filter(e => 
                    e.source.lat >= s && e.source.lat <= n && 
                    e.source.lon >= w && e.source.lon <= e
                );
                if (localEdges.length > 0) {
                    edge = localEdges[Math.floor(Math.random() * localEdges.length)];
                }
            }
            
            if (!edge) edge = this.cityEdges[Math.floor(Math.random() * this.cityEdges.length)];
            
            if (edge) {
                const level = Math.random() > (0.7 - this.areaConfig.params.trafficDensity * 0.5) ? 'heavy' : 'moderate';
                congested.push({
                    edgeId: edge.id,
                    level: level,
                    speed: 15 + Math.random() * 20
                });
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
                value: 0.5 + Math.random() * 2.5, // meters
                alert: true
            });
        }

        return sensors;
    }
}

export const dataIntegrationService = new DataIntegrationService();
