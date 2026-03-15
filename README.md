# AI-CityEngine 🏙️ & Traffic AI 🚗

This application is a local-only platform containing two core features:
1. **City Digital Twin Generation**: Extracts city map data (Leaflet) and renders it as an infrastructure node graph.
2. **Local Traffic AI**: Asynchronously processes uploaded videos through a local YOLOv8 Object Detection model to track vehicles, calculate congestion, and visualize the bounding boxes completely offline.

## 🛠️ Fully Local Architecture
**Zero Cloud Services are used for the AI tracking.** Your videos never leave your machine.
- **Frontend**: React (Vite)
- **Traffic Controller (Queue)**: Node.js (Express)
- **AI Worker**: Python (OpenCV + Ultralytics YOLO)

## 🚀 How to Run (1-Click)
We have provided a convenient batch script to spin up all 3 local services at once. Simply double click this file in your directory:
`start-traffic-ai.bat`

---

### Manual Startup (3 Terminals required)
If you prefer to start them manually or view the separate logs:

1. **Start the local React Frontend:**
   ```bash
   npm run dev
   ```

2. **Start the local Node backend (Upload Pipeline & Queue):**
   ```bash
   cd backend
   npm start
   ```

3. **Start the local Python AI processing worker:**
   ```bash
   cd python-worker
   python worker.py
   ```
