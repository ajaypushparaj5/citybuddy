# System Architecture

## Layer 1 — Map Data Layer

Responsible for extracting city infrastructure.

Sources:

- OpenStreetMap
- elevation data

Outputs:

- road graph
- infrastructure nodes
- terrain elevation

---

## Layer 2 — Simulation Engine

Responsible for rendering the city.

Components:

- map renderer
- simulation engine
- crisis simulation controls

---

## Layer 3 — Data Integration Layer

Responsible for ingesting city data.

Sources:

- weather APIs
- traffic APIs
- simulated IoT sensors
- emergency alerts

---

## Layer 4 — Agent System

Multiple agents analyze the city state.

Agents include:

CityMonitorAgent  
VisionAgent  
TrafficAgent  
EmergencyAgent  
InfrastructureAgent  
CrisisPredictionAgent  
DecisionAgent  

Agents communicate through shared city state.

---

## Layer 5 — Decision Layer

DecisionAgent analyzes insights from all agents and determines best response strategies.

---

## Layer 6 — User Interaction Layer

Provides user interface for:

- city simulation
- crisis controls
- query system
- agent monitoring dashboard