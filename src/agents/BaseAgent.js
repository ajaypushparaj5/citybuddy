// Base Agent Class
// Provides common utilities for city agents like communicating with Gemini and alerting.

export class BaseAgent {
    static globalLastRequestTime = 0;
    static currentGlobalCooldown = 5000; // Minimum 5 seconds between ANY Gemini API calls globally

    constructor(name, description, type = 'general') {
        this.name = name;
        this.description = description;
        this.type = type;
        this.cityData = null;
        this.onAlert = null;
        this.status = 'idle'; // 'idle', 'processing', 'alerting'
        this.alerts = [];
        this.lastUpdateTime = null;
        this.metrics = {
            totalTicks: 0,
            aiCalls: 0,
            lastRunMs: 0
        };
    }

    init(cityData, onAlert) {
        this.cityData = cityData;
        this.onAlert = (alert) => {
            const enrichedAlert = {
                id: Date.now() + Math.random(),
                agent: this.name,
                timestamp: new Date().toLocaleTimeString(),
                ...alert
            };
            this.alerts = [enrichedAlert, ...this.alerts].slice(0, 20);
            if (onAlert) onAlert(enrichedAlert);
        };
    }

    updateStatus(status) {
        this.status = status;
        this.lastUpdateTime = Date.now();
    }

    async promptAI(systemPrompt, userPrompt) {
        // We're using local Ollama, no API key needed!
        // We can safely remove the strict global rate limit backoffs since it's a local GPU.
        
        // We still keep a small lock to prevent React from blasting 10 requests at the EXACT same millisecond 
        // which might crash the local Ollama queue, but the cooldown is much lower.
        const now = Date.now();
        if (now - BaseAgent.globalLastRequestTime < 2000) {
            console.log(`[${this.name}] Local queue throttling. Delaying request.`);
            return null;
        }
        BaseAgent.globalLastRequestTime = Date.now();

        const start = Date.now();
        this.metrics.aiCalls++;
        this.updateStatus('processing');
        
        try {
            // Using qwen2.5 or llama3.1 locally. Ollama must be running on port 11434.
            const response = await fetch(`http://localhost:11434/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "qwen2.5:7b", // Great logic model that fits in 6GB VRAM
                    system: systemPrompt,
                    prompt: userPrompt,
                    stream: false,
                    format: 'json' // Force JSON output for structural consistency
                })
            });

            this.metrics.lastRunMs = Date.now() - start;
            this.updateStatus('idle');

            if (!response.ok) throw new Error(`Ollama API Error: ${response.status}`);

            const json = await response.json();
            return JSON.parse(json.response);
        } catch (err) {
            console.error(`[${this.name}] Ollama Prompt Failed. Is Ollama running?`, err);
            this.updateStatus('idle');
            return null;
        }
    }

    emitAlert(alert) {
        if (this.onAlert) {
            this.onAlert(alert);
        }
    }
}
