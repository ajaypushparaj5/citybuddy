import { BaseAgent } from './BaseAgent';

export class EmergencyAgent extends BaseAgent {
    constructor() {
        super('EmergencyAgent', 'Calculates emergency response routes and hospital accessibility.', 'emergency');
        this.activeIncidents = new Map();
        // Track when we last handled each incident TYPE to avoid re-running the LLM endlessly
        // for the same ongoing crisis (e.g. flood warning repeating every 30s).
        this.incidentCooldowns = new Map();
        this.COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes per incident type
    }

    // This agent might be called directly by the Manager when another agent emits an alert
    handleIncident(alert) {
        if (alert.type === 'accident' || alert.type === 'flood' || alert.type === 'flood_warning') {
            // Key by type + approximate location (1 decimal place ≈ 11km grid) so that
            // selecting a DIFFERENT area always triggers a fresh response, but the same
            // area doesn't spam the LLM every 30s.
            const locKey = `${alert.type}_${(alert.lat || 0).toFixed(1)}_${(alert.lon || 0).toFixed(1)}`;
            const lastHandled = this.incidentCooldowns.get(locKey) || 0;
            if (Date.now() - lastHandled < this.COOLDOWN_MS) {
                console.log(`[EmergencyAgent] '${locKey}' already handled recently. Skipping duplicate.`);
                return;
            }
            this.incidentCooldowns.set(locKey, Date.now());
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
            You are the EmergencyAgent for a smart city crisis response system.
            An incident has occurred at coordinates [${alert.lat?.toFixed(5)}, ${alert.lon?.toFixed(5)}].
            Type: ${alert.type} | Severity: ${alert.severity}

            Based on the available infrastructure options and the current abnormal city conditions (weather, transport, infrastructure failures), decide the best response.
            - For a flood/flood_warning: prioritise shelter establishment at a school, or dispatch rescue from nearest emergency station. Consider road closures or bad weather if active.
            - For an accident: dispatch ambulance from nearest hospital.
            - For any type: also recommend any police coordination if needed.

            Return ONLY this JSON:
            {
              "best_location_index": <number 0-${closestPois.length - 1}>,
              "response_type": "dispatch_ambulance" | "dispatch_fire" | "establish_shelter" | "police_response",
              "action_instructions": "<A single clear sentence: what unit goes from where to where and what to do, factoring in current hazards>"
            }
        `;

        const userPrompt = JSON.stringify({
            incident: { type: alert.type, severity: alert.severity, message: alert.message, lat: alert.lat, lon: alert.lon },
            available_infrastructure: closestPois.map((p, i) => `[${i}] ${p.name} (${p.type}) at [${p.lat?.toFixed(4)}, ${p.lon?.toFixed(4)}]`),
            current_hazards: this.currentAbnormalConditions || []
        });

        const decision = await this.promptAI(systemPrompt, userPrompt);

        if (decision && typeof decision.best_location_index === 'number') {
            const bestPoi = closestPois[decision.best_location_index] || closestPois[0];

            // Use the LLM-generated instruction if available, or fall back to a brief summary
            const instructions = decision.action_instructions ||
                `${decision.response_type?.replace(/_/g, ' ')} from ${bestPoi.name} to the incident site.`;

            this.emitAlert({
                type: 'emergency_dispatch',
                severity: 'high',
                message: instructions,
                lat: bestPoi.lat,
                lon: bestPoi.lon,
                targetLat: alert.lat,
                targetLon: alert.lon
            });
        }
    }

    async processTick(tickData) {
        // Emergency agent mostly reactive to cross-agent alerts, but we track environmental conditions for context
        this.currentAbnormalConditions = tickData.abnormalConditions || [];
    }
}
