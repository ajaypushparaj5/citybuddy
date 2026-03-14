import { BaseAgent } from './BaseAgent';

export class EmergencyAgent extends BaseAgent {
    constructor() {
        super('EmergencyAgent', 'Calculates emergency response routes and hospital accessibility.', 'emergency');
        // This agent listens for alerts from other agents primarily
        this.activeIncidents = new Map();
    }

    // This agent might be called directly by the Manager when another agent emits an alert
    handleIncident(alert) {
        if (alert.type === 'accident' || alert.type === 'flood') {
            console.log(`[EmergencyAgent] Analyzing response for incident: ${alert.message}`);
            this.calculateResponse(alert);
        }
    }

    async calculateResponse(alert) {
        // Collect all potential emergency response/shelter points
        const pois = this.cityData.nodes.filter(n => 
            n.type === 'hospital' || n.type === 'emergency' || n.type === 'school'
        );

        if (pois.length === 0) return;

        // Calculate planar distance and sort to find the 5 closest POIs
        const poisWithDistance = pois.map(p => {
            const d = Math.sqrt(Math.pow(p.lat - alert.lat, 2) + Math.pow(p.lon - alert.lon, 2));
            return { ...p, distance: d };
        });

        poisWithDistance.sort((a, b) => a.distance - b.distance);
        const closestPois = poisWithDistance.slice(0, 5).map(p => ({
            name: p.tags?.name || p.type,
            type: p.type,
            lat: p.lat,
            lon: p.lon
        }));

        const systemPrompt = `
            You are the EmergencyAgent.
            An incident occurred. Choose the most appropriate infrastructure to respond from or use as a shelter.
            - Accident: Dispatch from nearest hospital or emergency station.
            - Flood: Use nearest school as shelter or nearest emergency station for rescue.
            Return ONLY JSON: { "best_location_index": number, "response_type": "dispatch_ambulance"|"dispatch_fire"|"establish_shelter"|"police_response" }
        `;

        const userPrompt = JSON.stringify({
            incident: { type: alert.type, severity: alert.severity, message: alert.message },
            closest_options: closestPois.map((p, i) => `[${i}] ${p.name} (${p.type})`)
        });

        const decision = await this.promptAI(systemPrompt, userPrompt);
        
        if (decision && typeof decision.best_location_index === 'number') {
            const bestPoi = closestPois[decision.best_location_index] || closestPois[0];
            
            let actionText = "Emergency units dispatched";
            if (decision.response_type === "establish_shelter") actionText = "Emergency shelter established";
            else if (decision.response_type === "dispatch_fire") actionText = "Fire rescue dispatched";
            else if (decision.response_type === "police_response") actionText = "Police dispatched";

            this.emitAlert({
                type: 'emergency_dispatch',
                severity: 'high',
                message: `${actionText} from ${bestPoi.name} for: ${alert.type}.`,
                lat: bestPoi.lat,
                lon: bestPoi.lon,
                targetLat: alert.lat,
                targetLon: alert.lon
            });
        }
    }

    async processTick(tickData) {
        // Emergency agent mostly reactive to cross-agent alerts
    }
}
