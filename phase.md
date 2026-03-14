# Project Development Phases

## Phase 1 — Automatic Map Based City Generation

Goal:
Automatically generate a digital twin simulation from any selected map region.

Tasks:

1. Allow user to input or select a geographic area.
2. Fetch map data from OpenStreetMap.
3. Extract infrastructure including:

   - roads
   - intersections
   - hospitals
   - police stations
   - fire stations
   - schools
   - buildings
   - water bodies

4. Convert map data into a graph representation.
5. Generate a 2D simulation map automatically.
6. Render infrastructure icons and road network.
7. Add terrain elevation gradient visualization.

Output:
A scalable 2D city simulation automatically generated from map data.

---

## Phase 2 — Smart City Data Integration

Goal:
Integrate real-time and simulated smart city data.

Data sources:

- weather APIs
- news APIs
- traffic APIs
- simulated IoT sensors

Simulated sensors should include:

- traffic sensors
- water level sensors
- environmental sensors
- accident alerts

Create the first monitoring agent:

CityMonitorAgent

Responsibilities:

- continuously analyze incoming data
- detect anomalies
- trigger alerts

---

## Phase 3 — Multi Agent System

Create specialized agents.

VisionAgent
Detects accidents or incidents.

TrafficAgent
Analyzes road congestion and predicts traffic buildup.

EmergencyAgent
Evaluates emergency vehicle routes.

InfrastructureAgent
Suggests structural interventions.

CrisisPredictionAgent
Predicts potential disasters using environmental signals.

DecisionAgent
Determines best response actions.

Agents should communicate and share data.

---

## Phase 4 — Natural Language Query Interface

Create a search interface where users can ask questions about the city.

Example:

- fastest ambulance route
- safest evacuation path
- congestion hotspots

The query system should analyze the city graph and agent outputs.

---

## Phase 5 — Crisis Simulation System

Add controls to simulate disasters.

Examples:

- sea level rise
- heavy rainfall
- traffic accidents
- road blockages

Simulation should dynamically update the city state.

Agents must respond automatically.

---

## Phase 6 — Decision Recommendation System

Implement a central DecisionAgent.

This agent collects insights from all other agents and recommends actions.

Example outputs:

- dispatch emergency vehicles
- reroute traffic
- activate evacuation zones
- deploy infrastructure mitigation
