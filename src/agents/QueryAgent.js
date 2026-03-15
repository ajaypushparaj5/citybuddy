import { BaseAgent } from './BaseAgent';

export class QueryAgent extends BaseAgent {
    constructor() {
        super('QueryAgent', 'Answers citizen queries based on real-time city parameter state.', 'query');
    }

    // This agent does not process ticks like others; it is queried on demand.
    async processTick(tickData) {
        // no-op
    }

    async handleQuery(query, fullState, activeAlerts) {
        const { cityData, sensorData, areaParams } = fullState;

        const systemPrompt = `
            You are "CityBuddy", the official public AI assistant for the city of ${cityData?.name || 'the city'}.
            Your job is to answer citizen queries based on the EXACT CURRENT STATE of the city parameters.
            
            Here is the current simulation state (area parameters):
            -- Weather & Earth --
            Temperature: ${areaParams?.temperature}°C
            Wind Speed: ${areaParams?.windSpeed} km/h
            Rainfall: ${(areaParams?.rainfall * 100).toFixed(0)}%
            Fog/Visibility: ${(areaParams?.fog * 100).toFixed(0)}%
            Earthquake Intensity (Richter): ${areaParams?.earthquake}
            
            -- Transport & Traffic --
            Traffic Density: ${(areaParams?.trafficDensity * 100).toFixed(0)}%
            Accident Rate: ${(areaParams?.accidentRate * 100).toFixed(0)}%
            Major Road Closure: ${areaParams?.roadClosure ? 'YES' : 'NO'}
            Public Transport Failure: ${areaParams?.publicTransportFailure ? 'YES' : 'NO'}
            
            -- Infrastructure & Grid --
            Power Grid Load: ${areaParams?.powerGridLoad}%
            Blackout Active: ${areaParams?.powerOutage ? 'YES' : 'NO'}
            Water Pressure: ${areaParams?.waterPressure}%
            Cell Tower Congestion: ${(areaParams?.cellTowerCongestion * 100).toFixed(0)}%
            
            -- Population & Public --
            Crowd Density: ${(areaParams?.crowdDensity * 100).toFixed(0)}%
            Public Event Active: ${areaParams?.publicEvent ? 'YES' : 'NO'}
            Evacuation Ordered: ${areaParams?.evacuationOrder ? 'YES' : 'NO'}
            
            -- Crisis Scenarios --
            Fire Risk Index: ${(areaParams?.fireRisk * 100).toFixed(0)}%
            Chemical Spill: ${areaParams?.chemicalSpill ? 'YES' : 'NO'}
            Air Quality Index (AQI): ${areaParams?.airQuality}

            Active Abnormal Conditions Triggered: ${JSON.stringify(sensorData?.abnormalConditions || [])}
            Active AI Alerts: ${JSON.stringify(activeAlerts.map(a => a.type + ': ' + a.message))}

            Respond to the user's query gracefully and professionally. Be concise (1-3 sentences max). 
            If they ask about something that isn't actively abnormal but is in the parameters (like temperature), just give them the value.
            If they ask about safety, refer to the active alerts or evacuation status.
        `;

        try {
            // Because BaseAgent.promptAI expects JSON response by default (in some implementations),
            // and we want plain text here, we'll hit the raw LLM directly if promptAI is strict.
            // But let's check how promptAI works. It usually expects JSON if we tell it to. 
            // Here, we just want it to return text. We'll bypass the JSON requirement by doing a direct fetch,
            // or we'll wrap it in JSON. Let's wrap it in JSON to be safe, then extract "reply".

            const wrappedPrompt = systemPrompt + `\n\nReturn ONLY a JSON object with a single key "reply" containing your text response.`;
            const userPrompt = `Citizen Query: "${query}"`;

            const response = await this.promptAI(wrappedPrompt, userPrompt);
            if (response && response.reply) {
                return response.reply;
            }
            return "I apologize, I am unable to process your request at the moment.";
        } catch (error) {
            console.error("[QueryAgent] Error handling query:", error);
            return "Sorry, I am currently offline and cannot answer queries.";
        }
    }
}
