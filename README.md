# MaritimeShield AI
### AI-Powered Maritime Threat Intelligence & Supply Chain Risk Analysis Platform

A defense-tech / Bloomberg-Terminal-style command center for maritime threat intelligence, built with vanilla HTML/CSS/JS, Leaflet.js, Chart.js, and GSAP.

---

## What's included

This is a fully self-contained **frontend application** — no build step, no Node server required to run it. All 20 features from the brief are implemented with realistic simulated intelligence data (chokepoints, threat scores, vessels, incidents, forecasts, scenario simulator, multi-agent AI assistant, report generator).

```
maritimeshield/
├── index.html          # Main app shell — all views
├── css/
│   └── style.css       # Dark "defense intelligence" theme, glassmorphism
├── js/
│   ├── data.js          # Core intelligence dataset (chokepoints, ports, vessels, incidents, threats)
│   ├── map.js            # Leaflet map module (layers, heatmap, routes, vessel animation)
│   ├── charts.js         # Chart.js visualizations (risk trends, forecasts, scenario impact)
│   ├── assistant.js       # Multi-agent AI reasoning engine + scenario simulator
│   └── app.js              # Main app logic — navigation, panels, interactions
└── README.md
```

---

## ▶ Run it in VS Code with Live Server

1. **Unzip** the project and open the `maritimeshield` folder in VS Code (`File → Open Folder...`).
2. Install the **"Live Server"** extension (by Ritwick Dey) from the Extensions marketplace (`Ctrl+Shift+X`, search "Live Server").
3. In the file explorer, right-click **`index.html`** → **"Open with Live Server"**.
   - Or click **"Go Live"** in the bottom-right status bar, then open `index.html` in the browser tab that launches.
4. The app opens at `http://127.0.0.1:5500/index.html` (or similar port).

No `npm install`, no API keys, no database required — everything runs client-side using simulated intelligence data so every feature works immediately.

---

## Features map → implementation

| Feature | Where it lives |
|---|---|
| Global Interactive Maritime Map | Command Center map panel + full "Global Map" view (`map.js`) |
| Strategic Chokepoint Monitoring | Chokepoint Monitor panel + map markers (Hormuz, Suez, Bab-el-Mandeb, Malacca, Panama) |
| Threat Intelligence Engine | "Threat Intel" view — bar/pie charts + scored regional table |
| AI Maritime Analyst | "AI Analyst" view — multi-agent chat (`assistant.js`) |
| Route Risk Analyzer | "Route Analyzer" view — origin/destination/cargo → safe/alt/emergency routes on map |
| AI Predictive Risk Model | "Predictive" view — 30/60/90-day forecast charts + hotspot list |
| Supply Chain Vulnerability Engine | "Supply Chain" view — country/route/cargo → Health Score |
| Automated Incident Detection | Incident Monitor panel with type filtering |
| Maritime Digital Twin | "Digital Twin" view — scenario simulator (blockage / piracy / disruption) |
| AI-Generated Intelligence Reports | "Generate Global Maritime Risk Assessment" modal report |
| Defense-Grade Alert System | Top-bar alert indicator (GREEN/YELLOW/ORANGE/RED) + toast notifications |
| Maritime Heatmap | Risk heatmap layer toggle on both maps |
| Vessel Tracking Simulator | Animated vessels on full map, click for details panel |
| AI Insight Cards | Auto-generated cards on Command Center, refreshable |
| Executive Command Center | KPI row (Active Threats, High-Risk Routes, etc.) |
| Multi-Agent AI System | 5 specialist agents + Coordinator visible in AI Analyst view |
| AI Scenario Simulator | "What if Suez closes for 10 days?" → Digital Twin |
| Natural Language Map Search | Chat queries that auto-navigate/highlight the map |
| Modern UI | Glassmorphism, dark theme, JetBrains Mono + Inter, responsive |
| Hackathon Wow Factor | Big CTA banner → full interactive risk assessment report |

---

## Connecting a real backend (optional, for production)

The brief specifies Node.js/Express, MongoDB, and OpenAI/Gemini for a production deployment. The frontend is structured so this is a drop-in upgrade:

1. **Replace `assistant.js`'s `AIAssistant.respond()`** with a `fetch('/api/chat', { method: 'POST', body: JSON.stringify({ query }) })` call to an Express endpoint that forwards to the OpenAI/Gemini API with the live dataset as context.
2. **Replace the static arrays in `data.js`** (`INCIDENTS`, `VESSELS`, `THREAT_REGIONS`, etc.) with `fetch('/api/incidents')`, `/api/vessels`, etc., backed by MongoDB collections updated by a scheduled job (AIS feed ingestion, news scraping, etc.).
3. **Email alerts**: add an Express route that triggers on alert-level change (`/api/alerts`) using a transactional email service (SendGrid, etc.).
4. **PDF reports**: the "Generate Global Maritime Risk Assessment" modal already renders full report HTML — pipe it through a headless-Chrome/Puppeteer endpoint (`/api/report/pdf`) for true PDF export, or use the built-in "Export / Print Report" → browser print-to-PDF for the demo.

A minimal Express skeleton:

```js
// server.js
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public')); // place frontend files here

app.post('/api/chat', async (req, res) => {
  // call OpenAI/Gemini with req.body.query + maritime context
  res.json({ agent: 'Coordinator Agent', html: '...' });
});

app.listen(3000, () => console.log('MaritimeShield AI backend on :3000'));
```

---

## Notes

- Map tiles use CARTO Dark + Esri World Imagery (satellite toggle available in code via `MaritimeMap.toggleSatellite()`).
- All threat scores, incidents, and forecasts are **illustrative simulated intelligence data** for demonstration purposes.
