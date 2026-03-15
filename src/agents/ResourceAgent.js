import { BaseAgent } from './BaseAgent';

export class ResourceAgent extends BaseAgent {
    constructor() {
        super('ResourceAgent', 'Monitors and enforces city resource assets and budget constraints.', 'resource');
        this.lastCheck = 0;
        this.interval = 10000; // Check every 10s
    }

    async processTick(tickData) {
        const now = Date.now();
        if (now - this.lastCheck < this.interval) return;
        this.lastCheck = now;

        const { areaConfig, abnormalConditions = [] } = tickData;

        // Safety check if resources aren't configured yet
        if (!areaConfig || !areaConfig.resources) return;

        const budget = areaConfig.resources;
        let requiredAmbulances = 0;
        let requiredFireTrucks = 0;
        let requiredPolice = 0;

        // Mathematically calculate resource demand based on current active abnormalities
        for (const condition of abnormalConditions) {
            switch (condition.type) {
                case 'transport_high_accidents':
                    requiredAmbulances += 5;
                    requiredPolice += 2;
                    break;
                case 'crisis_fire_risk':
                    if (condition.severity === 'high') {
                        requiredFireTrucks += 10;
                        requiredAmbulances += 2;
                        requiredPolice += 5;
                    } else {
                        requiredFireTrucks += 3;
                    }
                    break;
                case 'crisis_chemical_spill':
                    requiredFireTrucks += 8; // Hazmat
                    requiredAmbulances += 10;
                    requiredPolice += 15;
                    break;
                case 'crisis_earthquake':
                    if (condition.severity === 'high') {
                        requiredAmbulances += 40;
                        requiredFireTrucks += 20;
                        requiredPolice += 50;
                    } else {
                        requiredAmbulances += 5;
                        requiredFireTrucks += 2;
                        requiredPolice += 5;
                    }
                    break;
                case 'pop_crowd_crush':
                    requiredAmbulances += 15;
                    requiredPolice += 25;
                    break;
                case 'pop_public_event':
                    requiredPolice += 10;
                    requiredAmbulances += 2;
                    break;
                case 'transport_road_closure':
                    requiredPolice += 4;
                    break;
            }
        }

        // Check if demand outstrips supply (exceeds budget)
        const shortages = [];
        if (requiredAmbulances > budget.ambulances) shortages.push('Ambulances');
        if (requiredFireTrucks > budget.fireTrucks) shortages.push('Fire Trucks');
        if (requiredPolice > budget.policeUnits) shortages.push('Police Units');

        if (shortages.length > 0) {
            // Determine the focus location
            let lat, lon;
            if (areaConfig.bbox) {
                const [[s, w], [n, e]] = areaConfig.bbox;
                lat = (s + n) / 2;
                lon = (w + e) / 2;
            } else if (this.cityData && this.cityData.bbox) {
                const [[s, w], [n, e]] = this.cityData.bbox;
                lat = s + (n - s) * 0.5;
                lon = w + (e - w) * 0.5;
            }

            this.emitAlert({
                type: 'resource_exhaustion',
                severity: 'high',
                message: `CRITICAL SHORTAGE: Demand exceeds available budget for: ${shortages.join(', ')}. Action Plan needed strictly enforcing limits.`,
                lat: lat,
                lon: lon
            });
            console.warn(`[ResourceAgent] 🚨 RESOURCE SHORTAGE! Demand (Amb:${requiredAmbulances}, Fire:${requiredFireTrucks}, Pol:${requiredPolice}) outstrips supply.`);
        }
    }
}
