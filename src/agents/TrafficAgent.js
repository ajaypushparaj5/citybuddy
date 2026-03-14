import { BaseAgent } from './BaseAgent';

export class TrafficAgent extends BaseAgent {
    constructor() {
        super('TrafficAgent', 'Analyzes road congestion and predicts potential traffic jams.', 'traffic');
        this.lastReasoningTime = 0;
        this.cooldown = 20000;
        this.lastConsensus = null;
    }

    async processTick(tickData) {
        const { traffic } = tickData;
        const heavyTraffic = traffic.filter(t => t.level === 'heavy');

        if (heavyTraffic.length < 3) return;

        const now = Date.now();
        if (now - this.lastReasoningTime < this.cooldown) return;

        // Simple change detection for traffic
        const currentState = heavyTraffic.map(t => t.edgeId).sort().join(',');
        if (currentState === this.lastConsensus) return;
        this.lastConsensus = currentState;
        this.lastReasoningTime = now;

        const systemPrompt = `
            You are the TrafficAgent for a Smart City Digital Twin.
            Analyze the following congestion data and provide insights.
            Identify if this is a "Spreading Congestion" or "Isolated Incident".
            Return JSON: { "type": "traffic", "severity": "medium"|"high", "message": "Short summary", "lat": number, "lon": number }
        `;

        // We pick the middle of the congestion for coordinates
        const sample = heavyTraffic[0]; // Simplified for now
        const edge = this.cityData.edges.find(e => e.id === sample.edgeId);
        const lat = edge ? (edge.source.lat + edge.target.lat) / 2 : this.cityData.center[1];
        const lon = edge ? (edge.source.lon + edge.target.lon) / 2 : this.cityData.center[0];

        const insight = await this.promptAI(systemPrompt, JSON.stringify(heavyTraffic));
        if (insight) {
            this.emitAlert({ ...insight, lat, lon });
        }
    }
}
