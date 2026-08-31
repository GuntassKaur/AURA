# AEGISNET FI
## AI-Powered Financial Threat Containment Command Infrastructure
### Developed for: Bank of India × IIT Hyderabad Hackathon

AEGISNET FI is an enterprise-grade cyber-financial defense platform designed to protect public and private sector banking infrastructure from organized money laundering, mule account networks, and automated cyber fraud. 

It acts as India's National Financial Cyber Defense Grid Command Center, combining live ledger streaming, deep graph neural network node embeddings, SHAP explainability, and multi-agent AI investigators.

---

## Technical Stack & Architecture

- **Frontend**: Next.js 14 (App Router) + TailwindCSS + Zustand + React Flow + Leaflet Maps + Framer Motion
- **Backend**: FastAPI (Python 3.11) + Async SQLAlchemy + WebSockets + Uvicorn
- **Databases**: PostgreSQL (Audit ledger, cases & compliance state) + Redis (Real-time message pub/sub bus)
- **Machine Learning Core**: XGBoost Classifier (Live fraud probability) + SHAP (Inference drivers) + NetworkX (Topology metrics & cycle routing) + PyTorch GraphSAGE (Deep neighborhood node embeddings)
- **AI Agents**: LangGraph Multi-Agent Workflows (Threat Intelligence, Correlation, Investigator, and Compliance Agents)
- **Forensic PDF Export**: ReportLab (FIU-IND compliant STR-1 forms)

---

## Folder Structure

```
boi/
├── frontend/
│   ├── app/                 # Next.js App routing
│   ├── components/          # Cyber command HUD, graphs, charts, ticker, maps
│   ├── lib/                 # Zustand store, hooks, API clients
│   ├── styles/              # Global css scanlines & glassmorphism
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (transactions, graph, compliance, freeze)
│   │   ├── core/            # Configs, DB async connection setup
│   │   ├── models/          # SQLAlchemy Database tables
│   │   ├── ml/              # XGBoost training & Dataset Loader
│   │   ├── services/        # Fraud scoring, NetworkX graph, PDF rendering, GraphSAGE, Freeze
│   │   ├── websocket/       # WS manager & Redis pub/sub broadcaster
│   │   └── agents/          # LangGraph multi-agent core reasoning workflow
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml       # One-command orchestration
├── .env.example
└── README.md
```

---

## Quickstart Setup

### Prerequisites
- Docker Desktop installed (highly recommended for automatic setup of all services)
- Node.js v20+ (if running manually)
- Python 3.11 (if running manually)

### Method A: One-Command Orchestration (Docker)

From the project root:
```bash
docker-compose up --build
```
This launches:
1. **PostgreSQL** at port `5432` (Auto-creates schema from schema.sql)
2. **Redis** at port `6379`
3. **FastAPI backend** at `http://localhost:8000`
4. **Next.js frontend** at `http://localhost:3000`

---

### Method B: Manual Startup

#### 1. Setup Database & Redis
Ensure PostgreSQL and Redis are running locally. Create a database named `aegisnet`.

#### 2. Start Backend API
```bash
cd backend
python -m venv venv
source venv/Scripts/activate # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 3. Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to access the main HUD Dashboard.

---

## Validation & Demo Walkthrough

### 1. Ingest Data & Retrain models
- On the dashboard header, click **RETRAIN XGBOOST**. This will load pre-packaged samples, engineer dynamic velocity features, fit the classifier, and update the model registry.
- Alternatively, upload any PaySim-compliant CSV dataset to `/api/upload/dataset` via the upload controller.

### 2. Stream Live Ledger Transactions
- Open the dashboard at `http://localhost:3000`. The WebSocket ticker will automatically connect and stream live transactions showing amounts, channels, and live risk scores.

### 3. Trace Mule Cluster Topology
- Click any node on the central React Flow topology graph.
- The **AI Risk Diagnostics Engine** immediately recalculates and displays the risk dials, SHAP feature waterfalls, and counterfactual perturbations (e.g. *\"If transaction amount drops by ₹X and velocity slows, risk levels drop to Watch\"*).

### 4. Run Multi-Agent AI Investigator
- Click **RUN AGENTS** in the bottom panel.
- This fires the LangGraph pipeline, streaming agent thoughts (Threat, Correlation, Investigator, Compliance) live onto the screen.

### 5. Execute Operational Freeze (System Containment)
- Click the big red button **EXECUTE OPERATIONAL FREEZE**.
- Instantly, a military-grade countdown sequence and containment HUD overlay will activate. Suspect accounts are locked down, matching transaction flows halt, and audit reference codes are logged.

### 6. Export Compliance STR
- Click **DOWNLOAD COMPLIANCE STR PDF**.
- This compiles a regulatory FIU-IND styled Suspicious Transaction Report PDF containing account tables, SHAP feature breakdown, agent reasoning logs, and the operational freeze audit trail.
