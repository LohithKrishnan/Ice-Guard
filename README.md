# ICEGUARD AI
### Antarctic Sea-Ice, Iceberg Trajectory & Navigation Decision Support System

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![XGBoost / Scikit-Learn](https://img.shields.io/badge/ML-XGBoost%20%7C%20Scikit--Learn-F7931E.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ICEGUARD AI** is an Antarctic maritime intelligence platform designed to assist polar vessels, scientific expeditions, and icebreaker captains in assessing sea-ice concentration, tracking massive tabular icebergs, forecasting kinematic drift trajectories with calibrated uncertainty cones, and optimizing navigation routes through high-risk polar waters.

---

## System Architecture

```
                                  ICEGUARD AI PLATFORM
                                 
  [ DATASETS & PROVENANCE ]
  ├── NSIDC Sea Ice CDR (v4) -------┐
  ├── BYU / USNIC Iceberg Tracks ---+--> [ DATA INGESTION PIPELINE ]
  ├── ERA5 Antarctic Reanalysis ----┤     (backend/data_ingestion/)
  ├── CMEMS Polar Currents ---------┤             │
  └── Sentinel-1 / MODIS Imagery ---┘             ▼
                                         [ SQLITE / POSTGIS REPO ]
                                         (backend/data/iceguard.db)
                                                  │
                                                  ▼
                                      [ FEATURE ENGINEERING ]
                                      ├── Geodesic / Coriolis Math
                                      ├── Spatial Wind / Current Forcing
                                      └── Lagged Concentration Differentials
                                                  │
                                                  ▼
                                        [ ML MODEL ENGINE ]
                                ├── Sea-Ice Multi-Horizon Gradient Booster
                                └── Iceberg Kinematic Trajectory Regressor
                                                  │
                                                  ▼
                                    [ DECISION SUPPORT LAYER ]
                                ├── Multi-Factor Risk Assessment Engine
                                ├── Shapely Polygonal Route Optimizer
                                └── AI Polar Copilot Reasoner
                                                  │
                                                  ▼
                                       [ FASTAPI REST API ]
                                       (backend/api/main.py:8000)
                                                  │
                                                  ▼
                                  [ NEXT.JS 14 COMMAND CENTER ]
                                  (src/app/* & Leaflet Polar Radar)
```

---

## Key Features

1. **Multi-Horizon Sea-Ice Forecasting**:
   - Machine learning model forecasting sea-ice concentration (%) across standard temporal horizons: **24h, 48h, 72h, and 7 Days**.
   - Incorporates surface air temperature, zonal/meridional wind drag, ocean current advection, and freezing point anomalies.
   - Evaluated model metrics: $R^2 \approx 0.972$, $\text{MAE} \approx 1.45\%$.

2. **Iceberg Kinematic Drift & Uncertainty Cones**:
   - Physics-informed regression model predicting tabular iceberg displacement vectors ($\Delta\text{lat}, \Delta\text{lng}$) and rotation.
   - Integrated Coriolis force parameterization ($f = 2\Omega\sin\phi$), deep-keel ocean drag, and atmospheric wind stress.
   - Calibrated uncertainty radii ($24\text{h}: 6.2\text{ km}$, $48\text{h}: 12.8\text{ km}$, $72\text{h}: 21.5\text{ km}$, $7\text{d}: 46.0\text{ km}$).

3. **Multi-Factor Navigation Risk Engine**:
   - Quantifies overall maritime hazard from 0 to 100 based on:
     - Sea-ice concentration & thickness (POLARIS-aligned ice numerals)
     - Proximity to drifting tabular bergs and bergy bits
     - Wind gust speeds and sub-zero air temperature (superstructure icing potential)
     - Current shear and vessel polar class rating (e.g. PC1 to PC7 / Open Water).
   - Generates actionable operational advisories: `NOMINAL`, `MODERATE_CAUTION`, `SEVERE_WARNING`, or `CRITICAL_PROHIBITED`.

4. **Safety-Weighted Route Optimization**:
   - Spatial hazard avoidance using Shapely buffer geometries surrounding icebergs and compact pack ice.
   - Computes alternative candidate routes:
     - **Safe Route**: Maximum distance buffer from ice hazards and lowest cumulative risk score.
     - **Fast Route**: Geodesic great-circle path with lowest transit time.
     - **Balanced Route**: Optimal compromise between transit duration and safety margins.

5. **AI Polar Copilot & Decision Support**:
   - Rule-grounded scientific reasoning engine delivering contextual advice on iceberg avoidance, sea-ice convergence, icebreaker escort recommendations, and icing alerts.

---

## Datasets & Data Provenance

All datasets ingested into the repository layer maintain verifiable provenance records in `backend/data/processed/*_metadata.json`:

| Dataset Identifier | Primary Source | Variables Ingested | Temporal Coverage / Resolution |
| :--- | :--- | :--- | :--- |
| **NSIDC Sea Ice Index** | National Snow & Ice Data Center (NASA/NOAA) | Sea Ice Concentration (0-100%), Thickness (m), Drift Speed (kt) | 25 km EASE-Grid 2.0 / Daily |
| **BYU / USNIC Antarctic Icebergs** | BYU Scatterometer Climate Record / US National Ice Center | Iceberg Coordinates, Dimensions (L x W), Area (sq km), Mass (Gt) | Named Giant Tabular Bergs (A-23A, A-76A, etc.) |
| **ERA5 Atmospheric Reanalysis** | ECMWF Copernicus Climate Change Service | 10m U/V Wind Components, 2m Air Temp (deg C), Surface Pressure (hPa) | 0.25 deg Global Grid / Hourly & Daily |
| **CMEMS Ocean Reanalysis** | Copernicus Marine Environment Monitoring Service | Surface & Keel Current Velocities (u, v in m/s), Sea Surface Temp (deg C) | 0.083 deg Polar Resolution |
| **Sentinel-1 SAR & MODIS** | ESA Copernicus Open Access Hub / NASA Earthdata | C-Band SAR Surface Reflectivity, Thermal/Optical Cloud-Free Imagery | 10-50 m Resolution Swaths |

> **Provenance Disclaimer**: Real ingested Antarctic data is utilized for training and spatial ground truth. Where real-time operational feeds require live satellite telemetries beyond offline storage, high-fidelity physics-based simulation ensures seamless decision-support capability.

---

## Directory Structure

```
.
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── alerts.py            # Alert lifecycle & acknowledgment endpoints
│   │   │   ├── copilot.py           # AI Copilot reasoning & advisory endpoint
│   │   │   ├── health.py            # API health & system readiness check
│   │   │   ├── icebergs.py          # Iceberg registry, details, & trajectory endpoints
│   │   │   ├── models.py            # ML model performance metrics & metadata
│   │   │   ├── risk.py              # Navigation risk score calculation endpoint
│   │   │   ├── routes.py            # Polygonal route optimization endpoint
│   │   │   ├── satellite.py         # Satellite scene catalog & sensor metadata
│   │   │   └── sea_ice.py           # Sea ice concentration & prediction endpoints
│   │   └── main.py                  # FastAPI application entrypoint with CORS & lifespan
│   ├── data/
│   │   ├── raw/                     # Raw ingested CSV/NetCDF datasets
│   │   ├── processed/               # Cleaned tabular datasets and JSON metadata
│   │   └── iceguard.db              # SQLite/SQLAlchemy persistent database
│   ├── data_ingestion/              # Ingestion modules for NSIDC, BYU, ERA5, CMEMS, SAR
│   ├── database/                    # SQLAlchemy ORM models, session, & repository layer
│   ├── ml/
│   │   ├── artifacts/               # Serialized model joblibs (.joblib) & metrics (.json)
│   │   ├── features/                # Spatial, geodesic, and time-lag feature extractors
│   │   ├── iceberg_trajectory/      # Iceberg drift regressor & uncertainty calibration
│   │   └── sea_ice/                 # Multi-horizon gradient boosting regressor
│   ├── services/                    # Risk engine, route optimizer, & copilot reasoner
│   └── tests/                       # Complete Pytest test suite (18 unit/API tests)
├── src/                             # Next.js 14 Frontend
│   ├── app/                         # App router (11 mission control views)
│   ├── components/                  # Glassmorphism panels, radar view, Leaflet polar maps
│   ├── context/                     # Simulation & Navigation state providers
│   └── services/                    # Frontend client services & mock/API fallback
├── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites
- **Python**: 3.10, 3.11, or 3.12
- **Node.js**: 18+ or 20+
- **npm** or **yarn**

### 1. Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd "Antartica Navigation Support System"

# Install Python dependencies
pip install fastapi uvicorn pydantic pandas numpy scikit-learn xgboost sqlalchemy shapely pytest httpx

# Ingest raw datasets & seed the database
python -m backend.data_ingestion.sea_ice
python -m backend.data_ingestion.iceberg
python -m backend.data_ingestion.weather
python -m backend.data_ingestion.ocean
python -m backend.data_ingestion.satellite
python -m backend.database.seed

# Train the Machine Learning Models
python -m backend.ml.sea_ice.train
python -m backend.ml.iceberg_trajectory.train

# Start the FastAPI Backend Server
python -m backend.api.main
# Or run with uvicorn directly:
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```
The interactive Swagger API documentation is accessible at: http://127.0.0.1:8000/docs.

### 2. Frontend Setup

In a separate terminal:

```bash
# Install frontend npm dependencies
npm install

# Run the development server
npm run dev

# Or build and launch the production application
npm run build
npm run start
```
The ICEGUARD AI Command Center will be available at: http://localhost:3000.

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, model statuses, and database connectivity. |
| `GET` | `/api/sea-ice/current` | Active sea-ice grid points with concentration, thickness, and drift. |
| `GET` | `/api/sea-ice/predictions` | 24h, 48h, 72h, and 7-day sea-ice forecast points. |
| `GET` | `/api/icebergs` | Full catalog of tracked tabular icebergs and metadata. |
| `GET` | `/api/icebergs/{id}` | Specific iceberg telemetry, trail history, and predictions. |
| `GET` | `/api/icebergs/{id}/trajectory`| Calibrated drift trajectory with uncertainty radii. |
| `POST`| `/api/risk/evaluate` | Computes multi-factor risk score for specified vessel & coordinates. |
| `POST`| `/api/routes/optimize` | Calculates Safe, Fast, and Balanced routes with hazard avoidance. |
| `GET` | `/api/satellite/scenes` | Filterable catalog of polar Sentinel-1 SAR and optical swaths. |
| `GET` | `/api/models/metrics` | Evaluation metrics (R2, MAE, RMSE) and training details. |
| `POST`| `/api/copilot/query` | Grounded AI polar copilot reasoning and decision recommendations. |
| `GET` | `/api/alerts` | Active navigation, meteorological, and iceberg proximity alerts. |
| `POST`| `/api/alerts/{id}/ack` | Acknowledges an active alert. |

---

## Running Automated Tests

Run the complete backend test suite:

```bash
python -m pytest backend/tests -v
```

**Test Coverage Summary**:
- `test_preprocessing.py`: Sea-ice, iceberg, meteorological ingestion & geodesic math.
- `test_models.py`: Gradient Booster inference, Kinematic Trajectory regression, Coriolis calculations, and uncertainty cone calibrations.
- `test_risk_and_routes.py`: Navigation risk classification, Shapely hazard buffering, route optimizer candidate paths, and AI Copilot reasoning.
- `test_api.py`: Full end-to-end FastAPI endpoint validation.

---

## Operational Scope & Safety Disclaimers

> **SAFETY NOTICE**: ICEGUARD AI is an advanced decision-support and navigational intelligence system. It is designed to augment, not supersede, certified polar navigators, standard IMO Polar Code protocols, official WMO Ice Analyst charts, and onboard radar/sonar observations. Master mariners retain ultimate responsibility for vessel safety in ice-covered waters.
