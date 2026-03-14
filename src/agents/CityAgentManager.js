import { CityMonitorAgent } from './CityMonitorAgent';
import { TrafficAgent } from './TrafficAgent';
import { EmergencyAgent } from './EmergencyAgent';
import { CrisisPredictionAgent } from './CrisisPredictionAgent';

export class CityAgentManager {
    constructor() {
        this.agents = new Map();
        this.onAlertCallback = null;
    }

    addAgent(agent) {
        this.agents.set(agent.name, agent);
        console.log(`[CityAgentManager] Added agent: ${agent.name}`);
    }

    init(cityData, onAlert) {
        this.onAlertCallback = onAlert;
        this.agents.forEach(agent => {
            agent.init(cityData, (alert) => {
                // Cross-agent communication: EmergencyAgent listens to all alerts
                const emergencyAgent = this.agents.get('EmergencyAgent');
                if (emergencyAgent && agent.name !== 'EmergencyAgent') {
                    emergencyAgent.handleIncident(alert);
                }
                
                this.onAlertCallback(alert);
            });
        });
    }

    processTick(tickData) {
        this.agents.forEach(agent => {
            agent.metrics.totalTicks++;
            agent.processTick(tickData);
        });
    }

    getAgentStates() {
        return Array.from(this.agents.values()).map(agent => ({
            name: agent.name,
            description: agent.description,
            type: agent.type,
            status: agent.status,
            alerts: agent.alerts,
            metrics: agent.metrics,
            lastUpdateTime: agent.lastUpdateTime
        }));
    }
}

export const agentManager = new CityAgentManager();
// Register agents in specific order
agentManager.addAgent(new CityMonitorAgent());
agentManager.addAgent(new TrafficAgent());
agentManager.addAgent(new EmergencyAgent());
agentManager.addAgent(new CrisisPredictionAgent());
