import { BaseAgent } from './BaseAgent';

export class TrafficAgent extends BaseAgent {
    constructor() {
        super('TrafficAgent', 'Analyzes road congestion and predicts potential traffic jams.', 'traffic');
        this.lastReasoningTime = 0;
        this.cooldown = 20000;
        this.lastConsensus = null;
    }

    async processTick(tickData) {
        const { traffic, abnormalConditions = [] } = tickData;
        const heavyTraffic = traffic.filter(t => t.level === 'heavy');

        // Only trigger if there is heavy traffic OR some transport/weather anomaly that affects traffic
        const transportIssues = abnormalConditions.filter(a => a.type.startsWith('transport_') || a.type.startsWith('weather_'));
        if (heavyTraffic.length < 3 && transportIssues.length === 0) return;

        const now = Date.now();
        if (now - this.lastReasoningTime < this.cooldown) return;

        // Simple change detection for traffic
        const currentState = heavyTraffic.map(t => t.edgeId).sort().join(',') + transportIssues.map(a => a.type).join(',');
        if (currentState === this.lastConsensus) return;
        this.lastConsensus = currentState;
        this.lastReasoningTime = now;

        const systemPrompt = `
            You are the TrafficAgent for a Smart City Digital Twin.
            Analyze the following congestion data and abnormal city conditions (like road closures, weather, transit failures).
            Identify if this is a "Spreading Congestion", "Isolated Incident", or "Systemic Transit Failure".
            Return JSON: { "type": "traffic", "severity": "medium"|"high", "message": "Short summary of the traffic situation and cause", "lat": number, "lon": number }
        `;

        // We pick the middle of the congestion for coordinates, or default to city center
        const sample = heavyTraffic[0];
        const edge = sample ? this.cityData.edges.find(e => e.id === sample.edgeId) : null;
        const lat = edge ? (edge.source.lat + edge.target.lat) / 2 : this.cityData.center[1];
        const lon = edge ? (edge.source.lon + edge.target.lon) / 2 : this.cityData.center[0];

        const context = JSON.stringify({
            heavyTraffic: heavyTraffic,
            abnormalConditions: abnormalConditions
        });

        const insight = await this.promptAI(systemPrompt, context);
        if (insight) {
            this.emitAlert({ ...insight, lat, lon });
        }
    }
}
