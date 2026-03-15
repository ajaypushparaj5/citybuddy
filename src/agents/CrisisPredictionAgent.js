
import { BaseAgent } from './BaseAgent';

export class CrisisPredictionAgent extends BaseAgent {
    constructor() {
        super('CrisisPredictionAgent', 'Predicts potential disasters like flash floods using environmental signals.', 'crisis');
        this.lastCheck = 0;
        this.interval = 30000; // Check every 30s
    }

    async processTick(tickData) {
        const { weather, sensors, areaConfig, abnormalConditions = [] } = tickData;
        const now = Date.now();
        if (now - this.lastCheck < this.interval) return;
        this.lastCheck = now;

        // Check for crisis-inducing parameters: heavy rain OR specific crisis anomalies
        const hasCrisisCondition = abnormalConditions.some(c => c.type.startsWith('crisis_') || c.type.startsWith('weather_'));

        if (weather.rainfall > 50 || hasCrisisCondition) {
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
                Analyze the environmental signals, current sensors, and abnormal area conditions.
                The affected location is: ${locationDesc}.
                Predict if this zone is at risk of a major crisis (flash flooding, fire spread, structural collapse from earthquake, crowd crush, grid failure, etc).
                Look closely at the abnormalConditions array. This contains thresholds that have been crossed (e.g., high wind, severe traffic, power outages).
                If risk > 70%, return a JSON alert:
                { "type": "flood_warning" | "fire_warning" | "structural_collapse" | "grid_failure" | "crisis_alert", "severity": "medium" or "high", "message": "One sentence about the specific crisis risk and location" }
                If risk is low (no critical abnormal conditions compounding), return: { "no_risk": true }
            `;

            const prediction = await this.promptAI(systemPrompt, JSON.stringify({ sensors, abnormalConditions }));
            if (prediction && !prediction.no_risk && !prediction.No_Risk) {
                // Determine the alert type from prediction or default to crisis_alert
                const alertType = prediction.type || prediction.Type || 'crisis_alert';

                this.emitAlert({
                    ...prediction,
                    type: alertType.toLowerCase().replace(/ /g, '_'),
                    severity: prediction.severity?.toLowerCase() || 'high',
                    lat,
                    lon
                });
            }
        }
    }
}
