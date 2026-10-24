# GridGuard ⚡ — Intelligent Power Outage Monitoring & Escalation Platform

> **Hackathon Track:** AI for Humanity / Public Infrastructure Resilience  
> **Demonstration Region:** Kochi & Ernakulam District, Kerala, India  
> **Tech Stack:** React 19, Vite, Tailwind CSS, Leaflet & OpenStreetMap, Recharts, Lucide Icons, Python FastAPI, SQLAlchemy, SQLite

---

## 1. Product Vision & Problem Statement

During power grid failures, consumers face confusion regarding the extent of the outage, estimated restoration times, and who to contact. Simultaneously, utility control rooms are inundated with redundant complaints, and delayed high-voltage repairs frequently exceed critical safety thresholds without reaching executive decision-makers.

**GridGuard** transforms fragmented outage reports into coordinated incidents, recommends transparent priorities based on critical infrastructure (hospitals, ICUs, water treatment, railway transit), tracks restoration lifecycles, and **automatically escalates SLA breaches to higher supervisory officials**.

> **⚠️ Honest Demonstration Notice:** This hackathon application operates with realistic, simulated demonstration data centered around Kochi and Ernakulam, Kerala, India. It is not connected to live KSEB SCADA hardware, real electricity boards, or live emergency services.

---

## 2. Key Intelligent Features

### 📍 A. Intelligent Incident Grouping
- Evaluates spatial distance using the **Haversine formula** ($\le 2.0\text{ km}$ threshold), submission time proximity, and fault category matching.
- Automatically suggests or groups clustered complaints into a single master incident.
- Displays transparent grouping confidence (e.g. *82% spatial-temporal match, 340m from active fault*) to prevent duplicate crew dispatches.

### 🧠 B. Explainable Priority Intelligence
- Evaluates fault severity, estimated consumer impact, hazard risk (e.g., live sagging wires), critical facility keywords (*Medical College Hospital, Neonatal ICU, Oxygen Plant, Metro, Dialysis*), and outage duration.
- Generates a **0–100 score** mapped to **Critical, High, Medium, or Low** priority.
- Provides a human-readable explanation of contributing factors instead of an opaque black box.
- Supports **Operator Priority Override** with mandatory recorded justification for full auditability.

### ⏱️ C. SLA Sentinel & Automatic Supervisory Escalation
- Monitors active incidents against priority-based SLA deadlines:
  - **Critical:** 15 minutes
  - **High:** 30 minutes
  - **Medium:** 60 minutes
  - **Low:** 120 minutes
- Automatically generates formal, structured incident notices when deadlines are breached.
- Higher officials can review notices, copy them to clipboard, acknowledge escalations with follow-up directives, and track complete audit trails.

### 🗺️ D. Geospatial Interactive Outage Map
- Real Leaflet & OpenStreetMap interactive tiles with custom SVG pins color-coded by priority:
  - 🔴 **Critical** (pulsing red glow)
  - 🟠 **High** (amber)
  - 🔵 **Medium** (blue)
  - ⚪ **Low** (slate)
  - 🟢 **Restored / Closed** (emerald)
- Interactive location picker allowing citizens to drop a pin or use browser geolocation.

---

## 3. User Roles (Demo Switcher)

Switch roles instantly from the top navigation bar:

1. **Consumer:**
   - Report power failures via interactive map pin or address.
   - Track active tickets using Incident ID (e.g. `GG-KL-1001`) or Report ID (e.g. `REP-KL-501`).
   - View 5-step status progression (*Reported → Verified → Assigned → Repair in Progress → Restored*).
   - View safety guidelines and Kerala emergency helpline numbers (1912, 112, 101).

2. **Utility Operator:**
   - Incident Management table with multi-parameter filtering and search.
   - Assign field repair squads (e.g., *Alpha 110kV Substation Squad*, *Feeder Rapid Response Unit 02*).
   - Update workflow status, progress notes, and public Estimated Restoration Times (ETR).
   - Override Priority with recorded audit reasons.

3. **Supervisor / Higher Official:**
   - Executive Escalation Centre tracking overdue SLA incidents.
   - Review automatically generated official action notices.
   - Acknowledge escalations and issue binding directives.
   - Configure SLA thresholds dynamically.

---

## 4. Live Hackathon Demonstration Walkthrough

Follow these steps for a complete live demo:

1. **Overview Dashboard:**
   - Observe live KPIs (Active Outages, Estimated Affected Consumers, Critical Faults, Overdue Breaches).
   - Notice the red alert banner highlighting overdue incidents in Kerala.
2. **Submit a New Report & Test Intelligent Grouping:**
   - Click **"Report Outage"** in the navigation bar.
   - Select a preset location (e.g., *Kalamassery Near Medical College*).
   - Category: *Damaged electrical infrastructure*, Severity: *Critical*.
   - Click **"Submit Outage Report"**.
   - Notice the **Intelligent Incident Grouping** banner activating, linking your report to `#GG-KL-1001` with an 80%+ proximity match!
3. **Dispatch & Workflow in Incident Management:**
   - Switch role to **Utility Operator** and navigate to **Incident Management**.
   - Open `#GG-KL-1002` (InfoPark Expressway).
   - Click **"Assign Field Squad"** → dispatch *Feeder Rapid Response Unit 02*.
   - Advance status to *Repair in Progress* and update the Estimated Restoration Time.
4. **Demonstrate Automated SLA Escalation:**
   - Click **"+15m Sim"** in the top demo banner to advance simulated time.
   - Notice the notification bell badge increment and an in-app alert banner appear.
   - Open **Escalation Centre** to view the newly escalated incident.
   - Click **"View Message"** to review the auto-generated official notice, then click **"Acknowledge & Direct"** to record executive follow-up action.
5. **Analytics & Historical Insights:**
   - Navigate to **Analytics** to view Recharts visualisations: outages by fault classification, priority breakdown, recurring sector hotspots, and cycle time metrics.
6. **Repeatable Demo:**
   - Click **"Demo Controls"** → **"Reset Demo Data"** at any time to restore the benchmark dataset.

---

## 5. Local Setup & Startup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+) (Optional, if running backend API)

### Frontend (Zero-Config, Runs Immediately)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend (FastAPI + SQLite, Optional)
```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
python -m uvicorn backend.main:app --reload --port 8000
```
API Documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 6. Architecture & File Structure

```
GridGuard/
├── backend/
│   ├── database.py       # SQLite engine & session setup
│   ├── engine.py         # GridGuard Intelligence Engine (Haversine grouping, scoring, SLA monitor)
│   ├── main.py           # FastAPI REST API endpoints
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic schemas
│   └── seed.py           # Python database seeder
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapViewer.jsx        # Leaflet OpenStreetMap with custom SVG priority pins
│   │   │   ├── Navbar.jsx           # Nav, role switcher, demo controls & toast notifications
│   │   │   └── StatusBadge.jsx      # Reusable priority & status badges
│   │   ├── data/
│   │   │   ├── incidentStore.js     # Centralized reactive store, grouping engine, SLA sentinel
│   │   │   └── seedData.js          # Kerala demonstration benchmark dataset
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.jsx    # Recharts data-driven visualisations
│   │   │   ├── EscalationCentre.jsx # Supervisor portal & escalation notice generator
│   │   │   ├── IncidentManagement.jsx # Control room table, team dispatch & priority override
│   │   │   ├── LiveMapPage.jsx      # Fullscreen interactive map with multi-filter drawer
│   │   │   ├── Overview.jsx         # Command center KPI overview
│   │   │   └── ReportOutagePage.jsx # Consumer report form with interactive map picker & tracker
│   │   ├── App.jsx                  # React Router setup & reactive listeners
│   │   ├── index.css                # Tailwind directives & Leaflet styling
│   │   └── main.jsx                 # Vite application mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

*Built for the Hackathon **AI for Humanity** track.*



