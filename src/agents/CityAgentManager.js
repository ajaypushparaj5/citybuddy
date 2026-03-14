import { CityMonitorAgent } from './CityMonitorAgent';
import { TrafficAgent } from './TrafficAgent';
import { EmergencyAgent } from './EmergencyAgent';
import { CrisisPredictionAgent } from './CrisisPredictionAgent';

export class CityAgentManager {
    constructor() {
        this.agents = new Map();
        this.onAlertCallback = null;
        this.subscribers = new Set();
        this.globalAlerts = [];
    }

    // Subscribe to global alerts (Useful for external React components like CitizenDashboard)
    subscribe(callback) {
        this.subscribers.add(callback);
        // Fire it immediately with current alerts state to populate UI
        callback(this.globalAlerts);
        
        return () => {
            this.subscribers.delete(callback);
        };
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
                // Update full local alert state
                this.globalAlerts = [alert, ...this.globalAlerts].slice(0, 50);

                // Notify UI directly if configured
                if (this.onAlertCallback) {
                    this.onAlertCallback(alert);
                }

                // Notify all external React subscribers
                this.subscribers.forEach(callback => callback(this.globalAlerts));
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
