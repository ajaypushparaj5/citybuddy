# 🏙️ AI-CityEngine — Autonomous Digital Twin for Smart City Crisis Management

> A real-time AI-powered digital twin platform that ingests live city data, simulates crises, deploys a multi-agent AI swarm, and generates authoritative government-grade action plans — all from any city on Earth.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo Flow](#live-demo-flow)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [AI Agent Swarm](#ai-agent-swarm)
- [Simulation Parameters](#simulation-parameters)
- [Supabase Integration](#supabase-integration)
- [Citizen Dashboard](#citizen-dashboard)
- [Development Phases](#development-phases)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [API Reference](#api-reference)

---

## Overview

AI-CityEngine is a **smart city digital twin** that:

1. Pulls **real road network + infrastructure data** from OpenStreetMap for any city
2. Renders a **live interactive 2D twin** with elevation, buildings, hospitals, and emergency services
3. Runs a **multi-agent AI swarm** (powered locally by Ollama/qwen2.5) that continuously monitors the city
4. Lets operators **simulate 20+ crisis parameters** (earthquakes, blackouts, fires, floods, traffic, etc.)
5. Generates **professional government-grade Action Plans** and publishes them to Supabase
6. Exposes a **Citizen Portal** where the public can query city status in natural language

---

## Live Demo Flow

```
Operator enters city name (e.g. "Mumbai")
    ↓
OSM Graph extracted → Digital Twin rendered on map
    ↓
Operator selects area → adjusts sliders (Earthquake: 7.2, Fire Risk: 85%)
    ↓
AI swarm detects anomalies → Crisis prediction fires
    ↓
EmergencyAgent calculates nearest hospitals & routes
    ↓
ActionPlanAgent generates 8-section government action plan
    ↓
Operator publishes → Full city state saved to Supabase
    ↓
Citizen searches city on Citizen Portal → Last published plan loaded
    ↓
CityBuddy AI chatbot answers citizen queries using saved context
```

---

## Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| React 19 + Vite 8 | UI framework & dev server |
| React-Leaflet / Leaflet | Interactive city map rendering |
| TailwindCSS v4 | Utility-first styling |
| Framer Motion | Smooth UI animations |
| Lucide React | Icon library |
| React Router v7 | Client-side routing |

### AI & Data
| Tool | Purpose |
|---|---|
| **Ollama (local)** | Runs `qwen2.5:7b` model locally on GPU/CPU — no API key needed for agents |
| **Gemini 2.5 Flash** | Used exclusively by `ActionPlanAgent` for high-quality plan generation |
| **OpenStreetMap (Overpass API)** | City graph, road network, infrastructure extraction |
| **Open-Elevation API** | Terrain elevation sampling for flood/crisis risk |

### Database & Backend
| Tool | Purpose |
|---|---|
| **Supabase** | City state persistence, action plan storage, Citizen Dashboard data feed |
| **Express.js** | Video upload queue for traffic AI (Port 5000) |
| **Python + YOLOv8** | Computer vision worker that detects vehicles and incidents in uploaded videos |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Digital Twin (React)                     │
│                                                              │
│  ┌─────────────┐    ┌──────────────────────────────────┐   │
│  │   Sidebar   │    │       CityTwinEngine (Map)        │   │
│  │  ─ City     │    │  ─ Leaflet Map                    │   │
│  │    Input    │    │  ─ Road Network (edges)           │   │
│  │  ─ Area     │    │  ─ Infrastructure POIs            │   │
│  │    Selection│    │  ─ Traffic heatmap overlay        │   │
│  │  ─ 20+      │    │  ─ Alert pins (AI crisis)         │   │
│  │    Sliders  │    │  ─ Elevation gradient             │   │
│  │  ─ Resources│    │  ─ Building footprints            │   │
│  │  ─ Agent    │    └──────────────────────────────────┘   │
│  │    Swarm    │                                            │
│  │    Monitor  │                                            │
│  └─────────────┘                                            │
└────────────────────────┬────────────────────────────────────┘
                         │ subscribe / tick
                         ▼
      ┌──────────────────────────────────────┐
      │      DataIntegrationService          │
      │  ─ Generates simulated traffic data  │
      │  ─ Applies area parameter overrides  │
      │  ─ Filters anomalous conditions      │
      │  ─ Emits tick every N seconds        │
      └────────────────┬─────────────────────┘
                       │ tick (anomalies only → general agents)
                       │ tick (all params → ActionPlan + Query)
                       ▼
      ┌──────────────────────────────────────┐
      │         CityAgentManager             │
      │  ─ Fan-out tick to all agents        │
      │  ─ Route alerts between agents       │
      │  ─ Expose agent telemetry to UI      │
      └──┬──────────┬──────────┬────────────┘
         │          │          │
    ╔════╝    ╔═════╝    ╔═════╝
    ║               ║               ║
    ▼               ▼               ▼
CrisisPrediction  TrafficAgent   ResourceAgent
Agent                           
    │               
    └── emits alert → EmergencyAgent → calculates routes
                   → ActionPlanAgent (on demand)
                                       │
                                       ▼
                               Gemini 2.5 Flash API
                                       │
                                       ▼
                               8-Section Action Plan
                                       │
                                       ▼
                               Supabase (upsert by city_name)
                                       │
                         ┌─────────────┘
                         ▼
                   Citizen Dashboard
                   CitizenDashboard.jsx
                   (fetches on city search)
                         │
                         ▼
                   QueryAgent (CityBuddy)
                   Answers natural language queries
                   using the full query_engine_feeder blob
```

---

## File Structure

```
AI-CityEngine/
├── .env                          # Environment variables (Supabase, Gemini, etc.)
├── vite.config.js                # Vite + TailwindCSS + watcher config
├── index.html                    # App entry point
├── package.json                  # Frontend dependencies
│
├── src/
│   ├── main.jsx                  # React root
│   ├── App.jsx                   # Router setup
│   ├── index.css                 # Global CSS (design tokens)
│   │
│   ├── pages/
│   │   ├── Home.jsx              # Landing / hero page
│   │   ├── DigitalTwin.jsx       # Main twin operator dashboard
│   │   ├── CitizenDashboard.jsx  # Public citizen portal (Supabase-fed)
│   │   └── Traffic.jsx           # Traffic analysis & video upload
│   │
│   ├── components/
│   │   ├── Sidebar.jsx           # City search + 20+ simulation controls
│   │   ├── CityTwinEngine.jsx    # Leaflet map renderer
│   │   ├── ActionPlanModal.jsx   # AI plan generation + Supabase publish
│   │   └── ...
│   │
│   ├── agents/
│   │   ├── BaseAgent.js          # Shared Ollama prompt, alert, metric logic
│   │   ├── CityAgentManager.js   # Orchestrates all agents + tick fan-out
│   │   ├── CityMonitorAgent.js   # Monitors city health metrics
│   │   ├── TrafficAgent.js       # Road congestion + traffic flow analysis
│   │   ├── CrisisPredictionAgent.js  # Predicts disasters from anomaly signals
│   │   ├── EmergencyAgent.js     # Routes emergency response to nearest POIs
│   │   ├── ActionPlanAgent.js    # Gemini-powered 8-section action plan
│   │   ├── QueryAgent.js         # CityBuddy NL chatbot for citizens
│   │   └── ResourceAgent.js      # Tracks available city resource units
│   │
│   ├── services/
│   │   ├── osmService.js         # OpenStreetMap Overpass API → city graph
│   │   ├── elevationService.js   # Open-Elevation grid sampling
│   │   ├── dataIntegrationService.js  # Tick generator + anomaly threshold filters
│   │   ├── supabaseClient.js     # Supabase JS client
│   │   └── localCacheService.js  # LocalStorage caching layer
│   │
│   └── utils/
│       └── geo.js                # Haversine distance, bbox helpers
│
├── backend/                      # Express.js video queue server
│   ├── server.js                 # Upload, status, job queue endpoints (Port 5000)
│   └── uploads/                  # Temp storage for video files (auto-deleted)
│
└── python-worker/                # Python YOLO computer vision worker
    ├── worker.py                 # Polls backend, runs YOLOv8, posts results
    ├── requirements.txt          # Python deps (ultralytics, opencv, etc.)
    ├── yolov8m.pt                # YOLOv8 medium model (52MB)
    └── yolov8n.pt                # YOLOv8 nano model (6MB)
```

---

## AI Agent Swarm

All agents extend `BaseAgent`, which handles Ollama queueing, rate limiting, alert enrichment, and metric tracking.

### 1. `CityMonitorAgent`
- **Trigger:** Every data tick
- **Input:** Traffic anomalies + sensor data
- **Role:** Detects city-level health degradation; emits `city_monitor` alerts
- **Data sent:** Anomalous conditions only (threshold-filtered)

### 2. `TrafficAgent`
- **Trigger:** Every data tick
- **Input:** Road edge congestion level + traffic density parameter
- **Role:** Identifies congestion patterns and predicts future hotspots
- **Data sent:** Anomalous conditions only

### 3. `CrisisPredictionAgent`
- **Trigger:** Every 30 seconds
- **Input:** `abnormalConditions` array (weather, infra, crisis flags above threshold)
- **Role:** Predicts if combined signals indicate imminent crisis (fire spread, flood, structural collapse, grid failure, etc.)
- **Output:** `{ type, severity, message }` alert directed at `EmergencyAgent`
- **Data sent:** Anomalous conditions only — **no raw parameters**

### 4. `EmergencyAgent`
- **Trigger:** On alert from any upstream agent
- **Input:** Alert location + nearby hospital/school/emergency POIs
- **Role:** Calculates best emergency response routes considering live conditions
- **Data sent:** Anomalous conditions only
- **Cooldown:** 5-minute per-location deduplication

### 5. `ResourceAgent`
- **Trigger:** Every data tick  
- **Input:** City resource budget (ambulances, fire trucks, police units, etc.)
- **Role:** Monitors available unit counts and warns if capacity drops critically
- **Data sent:** Anomalous conditions only

### 6. `ActionPlanAgent` ⭐
- **Trigger:** On-demand (operator presses "Generate Plan")
- **Input:** **Full parameters** — all 20+ sliders, ALL resource counts, elevation samples, nearby infrastructure names + distances, city resource budget
- **LLM:** Gemini 2.5 Flash (cloud)
- **Output:** 8-section government-grade markdown document:
  - Incident Summary, Threat Assessment, Phase 1-3 Response, Resource Deployment Table, Evacuation & Shelter Plan, Communication Protocol, Risk Escalation Triggers, Closing Authority Note
- **Constraint:** Cannot deploy more resources than the operator-set budget

### 7. `QueryAgent` (CityBuddy) ⭐
- **Trigger:** On-demand (citizen submits a question)
- **Input:** **Full parameters** from `query_engine_feeder` blob (loaded from Supabase or live twin)
- **LLM:** Ollama (qwen2.5:7b local)
- **Output:** 1–3 sentence professional answer to the citizen's question
- **Aware of:** All 20+ simulation parameters, active alerts, active abnormal conditions

### 8. `BaseAgent` (Abstract)
- Provides: `promptAI()`, `emitAlert()`, `updateStatus()`, `init()`
- Global 2-second Ollama queue throttle (prevents GPU saturation)
- Tracks per-agent metrics: `totalTicks`, `aiCalls`, `lastRunMs`

---

## Simulation Parameters

The following 20+ parameters can be adjusted live in the Sidebar. They are applied immediately to all agent tick data.

### ☀️ Weather & Earth
| Parameter | Range | Threshold for Alert |
|---|---|---|
| Rainfall | 0–100% | > 30% |
| Wind Speed | 0–150 km/h | > 40 km/h |
| Temperature | -20°C – 50°C | > 32°C or < 0°C |
| Fog / Visibility | 0–100% | > 40% |
| Earthquake (Richter) | 0–9 M | > 3.0 M |

### 🚦 Transport & Traffic
| Parameter | Range | Threshold |
|---|---|---|
| Traffic Density | 0–100% | > 70% |
| Accident Rate | 0–100% | > 40% |
| Major Road Closure | Toggle | Always alerts |
| Transit Network Failure | Toggle | Always alerts |

### ⚡ Infrastructure & Grid
| Parameter | Range | Threshold |
|---|---|---|
| Power Grid Load | 0–150% | > 85% |
| Blackout / Power Outage | Toggle | Always alerts |
| Water Pressure | 0–100% | < 50% |
| Cell Tower Congestion | 0–100% | > 70% |

### 👥 Population & Public
| Parameter | Range | Threshold |
|---|---|---|
| Crowd Density | 0–100% | > 70% |
| Major Public Event | Toggle | Always alerts |
| Evacuation Order | Toggle | Always alerts |

### 🔥 Crisis Scenarios
| Parameter | Range | Threshold |
|---|---|---|
| Fire Risk Index | 0–100% | > 60% |
| Hazmat / Chemical Spill | Toggle | Always alerts |
| Air Quality (AQI) | 0–500 | > 100 |

### 🛡️ City Resources (Budget)
| Resource | Default |
|---|---|
| Ambulances | 50 |
| Fire Trucks | 20 |
| Police Units | 100 |
| Medical Personnel | 200 |
| Helicopters | 2 |
| Volunteers | 500 |
| Emergency Funds | $5M |

---

## Supabase Integration

### Database Schema

**Table: `city_stats`**

```sql
CREATE TABLE city_stats (
  id              BIGSERIAL PRIMARY KEY,
  city_name       TEXT UNIQUE NOT NULL,      -- normalized lowercase key (e.g. "mumbai")
  health          INT,                        -- city health score 0-100
  traffic_anomalies INT,                      -- count of heavy traffic nodes
  alerts          JSONB,                      -- array of active AI alerts
  weather         JSONB,                      -- live weather snapshot
  action_plan     JSONB,                      -- { plan, source, timestamp }
  query_engine_feeder JSONB,                  -- full parameter blob for QueryAgent
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `query_engine_feeder` Blob Schema

```json
{
  "calamity": {
    "type": "crisis_fire_risk",
    "message": "...",
    "location": { "lat": 19.076, "lon": 72.877 }
  },
  "weatherAndEnvironment": {
    "temperature": 38, "windSpeed": 65, "rainfall": 0.8, "fog": 0.1, "earthquake": 0
  },
  "infrastructureAndTransport": {
    "powerGridLoad": 95, "powerOutage": false, "trafficDensity": 0.85, ...
  },
  "populationAndCrisis": {
    "crowdDensity": 0.6, "fireRisk": 0.9, "evacuationOrder": true, ...
  },
  "resources": {
    "ambulances": 50, "fireTrucks": 20, "policeUnits": 100, ...
  },
  "topography": { "elevationAtSite": 14 },
  "actionPlanSummary": "Phase 1: Deploy fire suppression units to..."
}
```

### Data Flow
1. **Operator** generates twin → runs scenario → AI generates action plan
2. **Publish button** upserts everything above to `city_stats` by `city_name`
3. **Citizen** visits Citizen Portal → enters city name → data is fetched from Supabase
4. **CityBuddy chatbot** uses the persisted `query_engine_feeder` to answer questions accurately

---

## Citizen Dashboard

The public-facing portal at `/citizen`. Features:

- **City search** → fetches live state from Supabase by city name
- **City Health Score** — computed from anomaly count
- **Active AI Alerts** — filtered for public visibility (medium + high severity)
- **Official Action Plan** — the last operator-published plan, formatted with markdown
- **CityBuddy AI Chatbot** — powered by QueryAgent with full parameter context
- **Incident Report Form** — citizens can submit reports with photo evidence + GPS
  - Auto-deduplication against existing active alerts
  - Injects malicious anomaly into the agent swarm for analysis

---

## Development Phases

### ✅ Phase 1 — Automatic Map-Based City Generation
- Input any city name → fetch real roads, intersections, infrastructure from OpenStreetMap
- Convert to graph representation (nodes + edges)
- Render 2D simulation map with icons for hospitals, police, fire stations, schools
- Terrain elevation gradient visualization via Open-Elevation API

### ✅ Phase 2 — Smart City Data Integration
- Simulated IoT sensor tick system (30s cadence)
- Traffic heatmap overlay on road edges
- Weather and environmental baseline generation
- Integration hooks for real weather/news/traffic APIs (Phase 2 feature flags in `.env`)

### ✅ Phase 3 — Multi-Agent AI Swarm
- 7 specialized agents deployed: `CityMonitor`, `Traffic`, `CrisisPrediction`, `Emergency`, `ActionPlan`, `Query`, `Resource`
- `BaseAgent` abstraction with Ollama integration, global throttling, and alert enrichment
- `CityAgentManager` orchestrates fan-out and inter-agent communication
- 5-minute incident cooldown system to prevent LLM spam

### ✅ Phase 4 — Natural Language Query Interface
- `QueryAgent` answers plain English questions about city status
- Full parameter context: all 20+ sliders, active alerts, abnormal conditions
- Available on both the Digital Twin and the Citizen Dashboard
- Supabase-persisted context enables queries even without a live twin

### ✅ Phase 5 — Crisis Simulation System
- 20+ sliders and toggles across 5 categories (Weather, Transport, Infrastructure, Population, Crisis)
- Anomaly threshold system — only abnormal values forwarded to general agents
- `ActionPlanAgent` and `QueryAgent` receive the full parameter set regardless
- Dynamic AI responses — fire risk raises fire warnings, earthquakes raise structural collapse risk

### ✅ Phase 6 — Decision Recommendation System
- `ActionPlanAgent` generates 8-section government-grade crisis action plans
- Resource-constrained planning — cannot dispatch resources that don't exist
- Plans published to Supabase and made available to Citizen Dashboard
- Elevation data integrated for better flood/terrain analysis

### 🚧 Phase 7 — Vision AI Traffic Analysis
- Video upload → Express.js job queue → Python/YOLOv8 worker
- Detects vehicles, counts density, identifies incidents per frame
- Results overlaid on the digital twin map as citizen-reported hotspots
- Auto-deletes uploaded video after processing (privacy-first)

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Models
VITE_AI_LLM_API_KEY=your-gemini-api-key       # Used by ActionPlanAgent

# Phase 2 APIs (optional — falls back to simulated data)
VITE_WEATHER_API_KEY=your-openweathermap-key
VITE_TRAFFIC_API_KEY=your-tomtom-key
VITE_NEWS_API_KEY=your-newsapi-key
```

---

## How to Run

### Prerequisites
- Node.js 18+ and npm
- [Ollama](https://ollama.ai) installed and running with qwen2.5:7b pulled
- Python 3.10+ (for vision worker, optional)

---

### 1. Start the Frontend (Digital Twin + Citizen Dashboard)

```bash
cd AI-CityEngine
npm install
npm run dev
# → http://localhost:5173
```

> **Note:** If you hit `ENOSPC` (file watcher limit), run:
> ```bash
> echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
> ```
> The `python-worker/venv` directory is already excluded from the Vite watcher.

---

### 2. Start the Local AI (Ollama)

```bash
# Pull the model once
ollama pull qwen2.5:7b

# Keep running in a terminal
ollama run qwen2.5:7b
# → http://localhost:11434
```

---

### 3. Start the Backend (Video Queue — Optional)

```bash
cd AI-CityEngine/backend
npm install
npm start
# → http://localhost:5000
```

---

### 4. Start the Python Vision Worker (Optional)

```bash
cd AI-CityEngine/python-worker
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 worker.py
```

---

### Full Stack Summary

| Service | Command | Port | Required? |
|---|---|---|---|
| Frontend (Vite) | `npm run dev` | 5173 | ✅ Yes |
| Ollama (LLM) | `ollama run qwen2.5:7b` | 11434 | ✅ Yes |
| Backend (Express) | `npm start` (in `/backend`) | 5000 | ⚡ Traffic AI only |
| Python Worker | `python3 worker.py` | — | ⚡ Traffic AI only |

---

## API Reference

### Backend Express API (`localhost:5000`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload a video file for traffic AI analysis |
| `GET` | `/status/:id` | Poll job status; returns `resultsData` when complete |
| `GET` | `/jobs/next` | Python worker polls for next job |
| `POST` | `/jobs/:id/complete` | Python worker submits results; original video deleted |

### Supabase Table: `city_stats`

| Operation | When |
|---|---|
| `UPSERT on city_name` | Operator publishes action plan |
| `SELECT WHERE city_name =` | Citizen searches for a city |

---

## License

MIT — Built for smart city crisis management research and demonstration.

---

> **Built with ❤️ using real OpenStreetMap data, local AI models, and a multi-agent architecture designed for real-world crisis response.**
