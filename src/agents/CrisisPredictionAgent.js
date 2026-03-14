import { BaseAgent } from './BaseAgent';

export class CrisisPredictionAgent extends BaseAgent {
    constructor() {
        super('CrisisPredictionAgent', 'Predicts potential disasters like flash floods using environmental signals.', 'crisis');
        this.lastCheck = 0;
        this.interval = 30000; // Check every 30s
    }

    async processTick(tickData) {
        const { weather, sensors, areaConfig } = tickData;
        const now = Date.now();
        if (now - this.lastCheck < this.interval) return;
        this.lastCheck = now;

        // Rainfall in generateWeather is 0-100, not 0-1 — threshold must match
        if (weather.rainfall > 50) {
            // Determine the focus location:
            // If the user has selected a specific area, use its centroid.
            // Otherwise warn the city centre.
            let lat, lon, locationDesc;

            if (areaConfig?.bbox) {
                const [[s, w], [n, e]] = areaConfig.bbox;
                lat = (s + n) / 2;
                lon = (w + e) / 2;
                locationDesc = `Selected area centroid: [${lat.toFixed(5)}, ${lon.toFixed(5)}]`;
            } else {
                const [[s, w], [n, e]] = this.cityData.bbox;
                lat = s + (n - s) * 0.5;
                lon = w + (e - w) * 0.5;
                locationDesc = `City centre: [${lat.toFixed(5)}, ${lon.toFixed(5)}]`;
            }

            const systemPrompt = `
                You are the CrisisPredictionAgent. 
                Analyze the rainfall intensity and current sensors.
                The affected location is: ${locationDesc}.
                Predict if this zone is at risk of flash flooding.
                If risk > 70%, return a JSON alert:
                { "type": "flood_warning", "severity": "medium" or "high", "message": "One sentence about the flood risk and location" }
                If risk is low, return: { "no_risk": true }
            `;

            const prediction = await this.promptAI(systemPrompt, JSON.stringify({ weather, sensors }));
            if (prediction && !prediction.no_risk && !prediction.No_Risk) {
                // LLMs sometimes return title case or wrong formatting (e.g., "Flood Warning")
                // Force the type strictly so the UI button condition matches.
                this.emitAlert({
                    ...prediction,
                    type: 'flood_warning',
                    severity: prediction.severity?.toLowerCase() || 'high',
                    lat,
                    lon
                });
            }
        }
    }
}
