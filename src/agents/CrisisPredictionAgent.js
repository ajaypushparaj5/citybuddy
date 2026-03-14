import { BaseAgent } from './BaseAgent';

export class CrisisPredictionAgent extends BaseAgent {
    constructor() {
        super('CrisisPredictionAgent', 'Predicts potential disasters like flash floods using environmental signals.', 'crisis');
        this.lastCheck = 0;
        this.interval = 30000; // Check every 30s
    }

    async processTick(tickData) {
        const { weather, sensors } = tickData;
        const now = Date.now();
        if (now - this.lastCheck < this.interval) return;
        this.lastCheck = now;

        // If rainfall is high and we are in a low elevation area
        if (weather.rainfall > 0.6) {
             const systemPrompt = `
                You are the CrisisPredictionAgent. 
                Analyze the rainfall intensity and current sensors. 
                Predict if a specific zone is at risk of flash flooding.
                Return JSON alert if risk is > 70%.
                JSON: { "type": "flood_warning", "severity": "medium"|"high", "message": "Prediction details", "lat": number, "lon": number }
            `;

            // Pick a random location in the bbox for the "prediction" focus
            const [[s, w], [n, e]] = this.cityData.bbox;
            const lat = s + Math.random() * (n - s);
            const lon = w + Math.random() * (e - w);

            const prediction = await this.promptAI(systemPrompt, JSON.stringify({ weather, sensors }));
            if (prediction) {
                this.emitAlert({ ...prediction, lat, lon });
            }
        }
    }
}
