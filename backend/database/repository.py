"""
Database Repository Layer - ICEGUARD AI
Abstracts all persistence, querying, and automatic seeding.
"""

import os
import json
from datetime import datetime, timezone
import pandas as pd
from sqlalchemy.orm import Session
from .db import SessionLocal, init_db
from .models import (
    Iceberg,
    IcebergObservation,
    IcebergPrediction,
    SeaIceObservation,
    SeaIcePrediction,
    WeatherObservation,
    Route,
    RiskAssessmentRecord,
    Alert,
    ModelVersion,
)

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "processed"))

class Repository:
    def __init__(self, db: Session = None):
        self.db = db or SessionLocal()

    def close(self):
        self.db.close()

    # Icebergs
    def get_all_icebergs(self):
        return self.db.query(Iceberg).all()

    def get_iceberg_by_id(self, berg_id: str):
        return self.db.query(Iceberg).filter(Iceberg.id == berg_id).first()

    def get_iceberg_latest_observation(self, berg_id: str):
        return (
            self.db.query(IcebergObservation)
            .filter(IcebergObservation.iceberg_id == berg_id)
            .order_by(IcebergObservation.timestamp.desc())
            .first()
        )

    def get_iceberg_trajectory_predictions(self, berg_id: str):
        return (
            self.db.query(IcebergPrediction)
            .filter(IcebergPrediction.iceberg_id == berg_id)
            .order_by(IcebergPrediction.forecast_hours.asc())
            .all()
        )

    # Sea-Ice
    def get_latest_sea_ice_observations(self):
        # Latest observation per sector
        latest_time = self.db.query(SeaIceObservation.timestamp).order_by(SeaIceObservation.timestamp.desc()).first()
        if not latest_time:
            return []
        return self.db.query(SeaIceObservation).filter(SeaIceObservation.timestamp == latest_time[0]).all()

    def get_sea_ice_forecasts(self):
        return self.db.query(SeaIcePrediction).order_by(SeaIcePrediction.horizon_hours.asc()).all()

    def get_sea_ice_predictions(self):
        return self.db.query(SeaIcePrediction).order_by(SeaIcePrediction.horizon_hours.asc()).all()

    # Alerts
    def get_alerts(self, severity: str = None):
        q = self.db.query(Alert)
        if severity and severity != "ALL":
            q = q.filter(Alert.severity == severity)
        return q.order_by(Alert.timestamp.desc()).all()

    def acknowledge_alert(self, alert_id: str):
        alert = self.db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.acknowledged = True
            self.db.commit()
            return True
        return False

    # Models
    def get_model_versions(self):
        return self.db.query(ModelVersion).all()

    # Seeding
    def seed_if_empty(self):
        init_db()
        if self.db.query(Iceberg).count() > 0:
            return  # Already seeded

        print("Seeding SQLite database from processed Antarctic data...")

        # 1. Seed Icebergs & Observations
        iceberg_csv = os.path.join(PROCESSED_DIR, "icebergs_processed.csv")
        if os.path.exists(iceberg_csv):
            df_berg = pd.read_csv(iceberg_csv)
            unique_bergs = df_berg.drop_duplicates(subset=["iceberg_id"])

            for _, row in unique_bergs.iterrows():
                berg = Iceberg(
                    id=row["iceberg_id"],
                    name=row["name"],
                    code=row["code"],
                    calving_shelf=row["calving_shelf"],
                    length_km=float(row["length_km"]),
                    width_km=float(row["width_km"]),
                    area_sq_km=float(row["area_sq_km"]),
                    thickness_m=float(row["thickness_m"]),
                    mass_gt=float(row["mass_gt"]),
                    risk_tier=row["risk_tier"],
                    description=f"Antarctic tabular mega-berg calved from {row['calving_shelf']}. Tracked via SAR surveillance.",
                )
                self.db.add(berg)

            self.db.commit()

            # Seed observations
            for _, row in df_berg.iterrows():
                obs = IcebergObservation(
                    iceberg_id=row["iceberg_id"],
                    timestamp=pd.to_datetime(row["timestamp"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    drift_speed_knots=float(row["drift_speed_knots"]),
                    drift_heading_deg=float(row["drift_heading_deg"]),
                    detection_confidence=int(row["detection_confidence"]),
                    sensor_source=row.get("sensor_source", "Sentinel-1 SAR C-Band"),
                    data_provenance=row.get("data_provenance", "REAL DATA (BYU/USNIC)"),
                )
                self.db.add(obs)

            self.db.commit()

        # 2. Seed Sea-Ice Observations
        sea_ice_csv = os.path.join(PROCESSED_DIR, "sea_ice_processed.csv")
        if os.path.exists(sea_ice_csv):
            df_ice = pd.read_csv(sea_ice_csv)
            # Take last 30 days
            df_ice["timestamp"] = pd.to_datetime(df_ice["timestamp"])
            cutoff = df_ice["timestamp"].max() - pd.Timedelta(days=14)
            recent_ice = df_ice[df_ice["timestamp"] >= cutoff]

            for _, row in recent_ice.iterrows():
                obs = SeaIceObservation(
                    timestamp=row["timestamp"],
                    sector_name=row["sector_name"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    concentration_percent=float(row["concentration_percent"]),
                    thickness_m=float(row["thickness_m"]),
                    surface_temp_c=float(row.get("surface_temp_c", -2.0)),
                    wind_speed_knots=float(row.get("wind_speed_knots", 15.0)),
                    data_provenance=row.get("data_provenance", "REAL DATA (NSIDC)"),
                )
                self.db.add(obs)

            # Seed 24h, 48h, 72h forecasts
            self.db.add_all([
                SeaIcePrediction(horizon_hours=24, mean_concentration=77.8, edge_displacement_km=-4.2, confidence=94.2),
                SeaIcePrediction(horizon_hours=48, mean_concentration=77.1, edge_displacement_km=-9.8, confidence=91.4),
                SeaIcePrediction(horizon_hours=72, mean_concentration=76.3, edge_displacement_km=-16.5, confidence=87.6),
            ])
            self.db.commit()

        # 3. Seed Alerts
        alerts_data = [
            Alert(
                id="alert-001",
                severity="CRITICAL",
                title="Iceberg Collision Hazard Detected",
                message="Iceberg A23A may intersect Route B within 18 hours. Predicted CPA is 1.8 nautical miles at 0.38 knots drift. Immediate course adjustment recommended.",
                source="AI Hydrodynamic Trajectory Engine",
                acknowledged=False,
                related_iceberg_id="A23A",
                latitude=-60.85,
                longitude=-48.20,
                suggested_action="Shift to Balanced AI Route (+28 nm clearance)",
            ),
            Alert(
                id="alert-002",
                severity="CRITICAL",
                title="Severe Katabatic Storm Front",
                message="Plateau pressure gradient causing sustained 55 knot katabatic gusts with peak bursts to 72 knots in Bransfield Strait. High risk of vessel superstructure icing.",
                source="Antarctic Mesoscale Prediction System (AMPS)",
                acknowledged=False,
                latitude=-63.20,
                longitude=-58.20,
                suggested_action="Activate thermal de-icing coils & adjust vessel trim",
            ),
            Alert(
                id="alert-003",
                severity="WARNING",
                title="Pack-Ice Concentration Surge",
                message="Sea-ice concentration increasing rapidly (+16% in 8 hours) in northern Joiner Passage corridor due to compressive southern swells.",
                source="Sentinel-1 SAR Radar Analysis",
                acknowledged=False,
                latitude=-62.10,
                longitude=-53.40,
                suggested_action="Maintain minimum 8 knots icebreaking transit speed",
            ),
            Alert(
                id="alert-004",
                severity="WARNING",
                title="Submerged Ice Ram Hazard",
                message="Sonar profiling detects an extensive underwater ice ram projecting 650m north-northwest from iceberg A76A flank.",
                source="Forward-Looking Sonar Telemetry",
                acknowledged=True,
                related_iceberg_id="A76A",
                latitude=-58.92,
                longitude=-42.15,
                suggested_action="Increase CPA stand-off distance to > 3.0 nm",
            ),
            Alert(
                id="alert-005",
                severity="ADVISORY",
                title="Satellite Swath Refreshed",
                message="Sentinel-1A SAR ascending pass over Weddell Basin received. 14 new sub-kilometer iceberg fragments mapped and cataloged.",
                source="ESA Copernicus Polar Ground Station",
                acknowledged=True,
            ),
            Alert(
                id="alert-006",
                severity="INFORMATION",
                title="Polar Code Route Validation",
                message="IMO Polar Code safety envelope verified for R/V POLARIS V (Polar Class PC3). All hull stress sensors within green threshold.",
                source="Navigation Decision Engine",
                acknowledged=True,
            ),
        ]
        self.db.add_all(alerts_data)

        # 4. Seed Model Versions
        model_versions = [
            ModelVersion(
                id="model-sea-ice-forecast",
                name="Sea-Ice Spatio-Temporal Forecast Engine",
                category="Cryospheric Dynamics",
                version="v3.4.1",
                architecture="Spatio-Temporal Gradient Boosting + GAT",
                status="ONLINE",
                primary_metric_label="Spatial IoU",
                primary_metric_value="94.2%",
                f1_score=0.942,
                inference_latency_ms=142,
            ),
            ModelVersion(
                id="model-iceberg-detection",
                name="Iceberg SAR Target Detection & Segmentation",
                category="Computer Vision / Radar",
                version="v4.1.0",
                architecture="YOLOv9-Polar + Speckle Filter",
                status="ONLINE",
                primary_metric_label="mAP@50",
                primary_metric_value="96.8%",
                f1_score=0.968,
                inference_latency_ms=85,
            ),
            ModelVersion(
                id="model-iceberg-trajectory",
                name="Hydrodynamic Iceberg Drift & Kinematics",
                category="Physics-Informed ML",
                version="v2.8.5",
                architecture="PINN + Ekman Current Coupling",
                status="ONLINE",
                primary_metric_label="72h Vector Precision",
                primary_metric_value="91.4%",
                f1_score=0.914,
                inference_latency_ms=110,
            ),
            ModelVersion(
                id="model-navigation-risk",
                name="Multi-Factor Maritime Hazard Classifier",
                category="Risk Assessment",
                version="v3.0.2",
                architecture="Bayesian Risk Network + XGBoost",
                status="ONLINE",
                primary_metric_label="ROC-AUC",
                primary_metric_value="0.954",
                f1_score=0.937,
                inference_latency_ms=64,
            ),
            ModelVersion(
                id="model-route-optimizer",
                name="Pareto-Optimal Ice Navigation Path Engine",
                category="Trajectory Optimization",
                version="v5.2.0",
                architecture="Constrained 4D A* + NSGA-II",
                status="ONLINE",
                primary_metric_label="Pareto Optimality",
                primary_metric_value="98.2%",
                f1_score=0.982,
                inference_latency_ms=210,
            ),
        ]
        self.db.add_all(model_versions)
        self.db.commit()
        print("Database seeding completed successfully.")

def get_repository() -> Repository:
    repo = Repository()
    repo.seed_if_empty()
    return repo
