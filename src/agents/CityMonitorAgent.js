import { BaseAgent } from './BaseAgent';

export class CityMonitorAgent extends BaseAgent {
    constructor() {
        super('CityMonitorAgent', 'Monitors real-time city infrastructure and sensor anomalies.');
        this.lastReasoningTime = 0;
        this.reasoningCooldown = 30000; // 30s min between different anomalies (increased to save tokens)
        this.refreshCooldown = 120000; // 2 min refresh if anomalies persist but are unchanged
        this.lastAnomalyState = null;
    }

    async processTick(tickData) {
        const { traffic, sensors, weather } = tickData;

        // 1. Heuristic Check: Are there any immediate red flags?
        const heavyTraffic = traffic.filter(t => t.level === 'heavy');
        const significantSensors = sensors.filter(s => s.type === 'accident' || (s.type === 'flood_sensor' && s.value > 1.5));

        if (heavyTraffic.length < 2 && significantSensors.length === 0) {
            // All quiet, reset state tracker
            this.lastAnomalyState = null;
            return;
        }

        // 2. Change Detection: Has the anomaly state actually changed since the last check?
        const currentAnomalyState = JSON.stringify({
            traffic: heavyTraffic.map(t => t.edgeId).sort(),
            sensors: significantSensors.map(s => `${s.type}-${s.lat}-${s.lon}`).sort()
        });

        const now = Date.now();
        const isNewState = currentAnomalyState !== this.lastAnomalyState;
        const cooldown = isNewState ? this.reasoningCooldown : this.refreshCooldown;

        if (now - this.lastReasoningTime < cooldown) {
            return;
        }

        // Update tracking
        this.lastAnomalyState = currentAnomalyState;
        this.lastReasoningTime = now;

        // 3. Prompt Gemini for analysis
        console.log(`[${this.name}] ${isNewState ? 'New anomalies' : 'Persistent anomalies'} detected. Prompting Gemini...`);
        
        const systemPrompt = `
            You are the CityMonitorAgent for a Smart City Digital Twin.
            Analyze the following sensor and traffic data and return a JSON list of alerts.
            Each alert must have: { "type": "traffic"|"accident"|"flood"|"weather", "severity": "low"|"medium"|"high", "message": "Short description", "lat": number, "lon": number }
            Return ONLY the valid JSON array of objects.
        `;

        const userPrompt = JSON.stringify({
            currentWeather: weather,
            activeTrafficAnomalies: heavyTraffic,
            sensorAlerts: significantSensors
        });

        const alerts = await this.promptAI(systemPrompt, userPrompt);
        
        if (alerts && Array.isArray(alerts)) {
            alerts.forEach(alert => this.emitAlert(alert));
        }
    }
}
