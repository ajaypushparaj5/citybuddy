// Base Agent Class
// Provides common utilities for city agents like communicating with Gemini and alerting.

export class BaseAgent {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.cityData = null;
        this.onAlert = null;
    }

    init(cityData, onAlert) {
        this.cityData = cityData;
        this.onAlert = onAlert;
    }

    async promptGemini(systemPrompt, userPrompt) {
        const apiKey = import.meta.env.VITE_AI_LLM_API_KEY;
        if (!apiKey) {
            console.warn(`[${this.name}] Gemini API key missing. Skipping reasoning.`);
            return null;
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
                    ],
                    generationConfig: {
                        response_mime_type: "application/json",
                    }
                })
            });

            if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);

            const json = await response.json();
            const text = json.candidates[0].content.parts[0].text;
            return JSON.parse(text);
        } catch (err) {
            console.error(`[${this.name}] Gemini Prompt Failed:`, err);
            return null;
        }
    }

    emitAlert(alert) {
        if (this.onAlert) {
            this.onAlert({
                id: Date.now() + Math.random(),
                agent: this.name,
                timestamp: new Date().toLocaleTimeString(),
                ...alert
            });
        }
    }
}
