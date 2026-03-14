// ActionPlanAgent.js
// Generates a detailed, authoritative crisis action plan for city authorities.
// Primary: Gemini 2.5 Flash (best reasoning). Fallback: local Ollama qwen2.5:7b

const GEMINI_API_KEY = import.meta.env.VITE_AI_LLM_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17';
const OLLAMA_MODEL = 'qwen2.5:7b';

/**
 * Haversine distance in km between two lat/lon points.
 */
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Build a rich context object for the AI to reason over.
 */
function buildContext({ alert, cityData, sensorData, elevationSamples }) {
    const { lat, lon } = alert;
    const now = new Date();

    // ── Nearest facilities (sorted by Haversine) ─────────────────────────────
    const withDist = (cityData?.nodes || [])
        .filter(n => n.type !== 'intersection' && n.lat && n.lon)
        .map(n => ({
            ...n,
            distKm: haversine(lat, lon, n.lat, n.lon),
            name: n.tags?.name || n.type
        }))
        .sort((a, b) => a.distKm - b.distKm);

    const nearbyHospitals = withDist.filter(n => n.type === 'hospital').slice(0, 5);
    const nearbyEmergency = withDist.filter(n => n.type === 'emergency').slice(0, 3);
    const nearbySchools = withDist.filter(n => n.type === 'school').slice(0, 4);

    // ── Congestion near the incident (~1km radius) ──────────────────────────
    const congestionNearby = (sensorData?.traffic || []).length;

    // ── Elevation at alert point ─────────────────────────────────────────────
    let elevAtPoint = null;
    if (elevationSamples && lat && lon) {
        // Simple nearest-sample elevation lookup
        const nearest = elevationSamples.reduce((best, s) => {
            const d = Math.abs(s.lat - lat) + Math.abs(s.lon - lon);
            return d < best.d ? { d, elev: s.elevation } : best;
        }, { d: Infinity, elev: null });
        elevAtPoint = nearest.elev;
    }

    return {
        incident: {
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            agent: alert.agent,
            timestamp: alert.timestamp,
            lat: lat?.toFixed(5),
            lon: lon?.toFixed(5),
        },
        location: {
            cityCenter: cityData?.center ? `[${cityData.center[1].toFixed(4)}, ${cityData.center[0].toFixed(4)}]` : 'unknown',
            elevationAtSite: elevAtPoint ? `${elevAtPoint.toFixed(1)} m above sea level` : 'unknown',
            timeLocal: now.toLocaleTimeString('en-IN', { hour12: true }),
            dateLocal: now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        },
        weather: sensorData?.weather ? {
            tempCelsius: sensorData.weather.temp?.toFixed(1),
            condition: sensorData.weather.condition,
            rainfallMm: sensorData.weather.rainfall?.toFixed(1),
        } : null,
        nearbyInfrastructure: {
            hospitals: nearbyHospitals.map(h => `${h.name} (${h.distKm.toFixed(2)} km)`),
            emergency: nearbyEmergency.map(e => `${e.name} (${e.distKm.toFixed(2)} km)`),
            schools: nearbySchools.map(s => `${s.name} (${s.distKm.toFixed(2)} km) [potential shelter]`),
        },
        roadNetwork: {
            totalEdges: cityData?.edges?.length || 0,
            congestedEdgesNow: congestionNearby,
        },
        infrastructureSummary: {
            totalHospitals: cityData?.infrastructure?.hospitals || 0,
            totalEmergency: cityData?.infrastructure?.emergency || 0,
        }
    };
}

/**
 * The detailed system prompt for a government/mayoral action plan.
 */
function buildSystemPrompt(context) {
    return `You are an expert smart city crisis response advisor directly assisting the Mayor and emergency authorities.
You have been given real-time sensor data and infrastructure information from a digital city twin.

Your task: Generate a COMPLETE, AUTHORITATIVE, and PROFESSIONALLY FORMATTED crisis action plan.

This document will be reviewed by:
- The Mayor / Municipal Commissioner
- Emergency Services Director
- Police Commissioner
- Public Health Officer

=== CITY CONTEXT ===
${JSON.stringify(context, null, 2)}

=== RESPONSE FORMAT ===
Write the action plan in clean markdown. Use this exact structure:

# 🚨 Crisis Action Plan
## Incident Summary
## Threat Assessment
## Phase 1: Immediate Response (0–30 minutes)
## Phase 2: Stabilisation (30 min – 4 hours)
## Phase 3: Recovery (4–72 hours)
## Resource Deployment Table
(Use a markdown table: | Resource | Source | Destination | Priority |)
## Evacuation & Shelter Plan
## Communication Protocol
## Risk Escalation Triggers
## Closing Authority Note

Be specific — use the actual hospital names, distance values, temperature, rainfall, and edge counts provided.
Write as if lives depend on clarity and speed. Use bullet points where helpful. Keep sections focused and actionable.`;
}

/**
 * Call Gemini 2.5 Flash. Returns plain-text markdown.
 */
async function callGemini(systemPrompt, contextJson) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: contextJson }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
    };
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

/**
 * Fallback: call local Ollama with qwen2.5:7b.
 * Returns plain-text markdown.
 */
async function callOllama(systemPrompt, contextJson) {
    const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            system: systemPrompt,
            prompt: contextJson,
            stream: false,
        })
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const json = await res.json();
    return json.response || null;
}

/**
 * Public API — call this to generate an action plan for any alert.
 * Returns { plan: string, source: 'gemini'|'ollama', error: string|null }
 */
export async function generateActionPlan({ alert, cityData, sensorData, elevationSamples }) {
    const context = buildContext({ alert, cityData, sensorData, elevationSamples });
    const systemPrompt = buildSystemPrompt(context);
    const contextJson = `Generate the action plan now for this crisis:\n${JSON.stringify(context.incident, null, 2)}`;

    // Try Gemini first
    try {
        const plan = await callGemini(systemPrompt, contextJson);
        if (plan) return { plan, source: 'gemini', error: null };
    } catch (err) {
        console.warn('[ActionPlanAgent] Gemini failed, falling back to Ollama:', err.message);
    }

    // Fallback to Ollama
    try {
        const plan = await callOllama(systemPrompt, contextJson);
        if (plan) return { plan, source: 'ollama', error: null };
    } catch (err) {
        console.error('[ActionPlanAgent] Ollama fallback also failed:', err.message);
        return { plan: null, source: null, error: err.message };
    }

    return { plan: null, source: null, error: 'Both AI providers failed.' };
}
