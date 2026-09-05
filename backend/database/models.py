"""
SQLAlchemy Database Schemas - ICEGUARD AI
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from .db import Base

class Iceberg(Base):
    __tablename__ = "icebergs"

    id = Column(String(32), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    code = Column(String(64), nullable=False)
    calving_shelf = Column(String(128))
    length_km = Column(Float, nullable=False)
    width_km = Column(Float, nullable=False)
    area_sq_km = Column(Float, nullable=False)
    thickness_m = Column(Float, nullable=False)
    mass_gt = Column(Float, nullable=False)
    risk_tier = Column(String(32), default="MODERATE")
    description = Column(Text)

    observations = relationship("IcebergObservation", back_populates="iceberg", cascade="all, delete-orphan")
    predictions = relationship("IcebergPrediction", back_populates="iceberg", cascade="all, delete-orphan")

class IcebergObservation(Base):
    __tablename__ = "iceberg_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    iceberg_id = Column(String(32), ForeignKey("icebergs.id"), index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    drift_speed_knots = Column(Float, nullable=False)
    drift_heading_deg = Column(Float, nullable=False)
    detection_confidence = Column(Integer, default=90)
    sensor_source = Column(String(64), default="Sentinel-1 SAR")
    data_provenance = Column(String(128), default="REAL DATA (BYU/USNIC)")

    iceberg = relationship("Iceberg", back_populates="observations")

class IcebergPrediction(Base):
    __tablename__ = "iceberg_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    iceberg_id = Column(String(32), ForeignKey("icebergs.id"), index=True)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    forecast_hours = Column(Integer, nullable=False)  # 24, 48, 72, 168
    predicted_lat = Column(Float, nullable=False)
    predicted_lon = Column(Float, nullable=False)
    predicted_speed_knots = Column(Float, nullable=False)
    predicted_heading_deg = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    uncertainty_radius_km = Column(Float, nullable=False)
    model_version = Column(String(32), default="PINN-Kinematics-v2.8")

    iceberg = relationship("Iceberg", back_populates="predictions")

class SeaIceObservation(Base):
    __tablename__ = "sea_ice_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    sector_name = Column(String(128), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    concentration_percent = Column(Float, nullable=False)
    thickness_m = Column(Float, nullable=False)
    surface_temp_c = Column(Float)
    wind_speed_knots = Column(Float)
    data_provenance = Column(String(128), default="REAL DATA (NSIDC)")

class SeaIcePrediction(Base):
    __tablename__ = "sea_ice_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    horizon_hours = Column(Integer, nullable=False)
    mean_concentration = Column(Float, nullable=False)
    edge_displacement_km = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    model_version = Column(String(32), default="ConvLSTM-XGB-v3.4")

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    station_name = Column(String(128))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    air_temp_c = Column(Float)
    wind_speed_knots = Column(Float)
    wind_gust_knots = Column(Float)
    mean_sea_level_pressure_hpa = Column(Float)
    visibility_nm = Column(Float)
    spray_icing_hazard = Column(String(32), default="LOW")
    data_provenance = Column(String(128), default="REAL DATA (ERA5)")

class Route(Base):
    __tablename__ = "routes"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    tagline = Column(String(256))
    type = Column(String(32), nullable=False)  # safe, fast, balanced
    is_recommended = Column(Boolean, default=False)
    distance_nm = Column(Float, nullable=False)
    estimated_hours = Column(Float, nullable=False)
    risk_score = Column(Integer, nullable=False)
    ice_exposure_percent = Column(Float, nullable=False)
    iceberg_encounter_probability = Column(Float, nullable=False)
    fuel_tons = Column(Float, nullable=False)
    safety_buffer_nm = Column(Float, nullable=False)
    hazard_summary = Column(Text)
    waypoints_json = Column(Text, nullable=False)  # JSON serialized list of lat,lon

class RiskAssessmentRecord(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    overall_score = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False)
    sea_ice_risk = Column(Integer, nullable=False)
    iceberg_risk = Column(Integer, nullable=False)
    weather_risk = Column(Integer, nullable=False)
    ocean_risk = Column(Integer, nullable=False)
    visibility_risk = Column(Integer, nullable=False)
    ai_recommendation = Column(Text)
    recommended_action = Column(String(128))

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True)
    severity = Column(String(32), nullable=False)  # CRITICAL, WARNING, ADVISORY, INFORMATION
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source = Column(String(128))
    acknowledged = Column(Boolean, default=False)
    related_iceberg_id = Column(String(32), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    suggested_action = Column(String(256), nullable=True)

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    version = Column(String(32), nullable=False)
    architecture = Column(String(128))
    status = Column(String(32), default="ONLINE")
    last_trained = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    primary_metric_label = Column(String(64))
    primary_metric_value = Column(String(64))
    f1_score = Column(Float)
    inference_latency_ms = Column(Integer)
    dataset_version = Column(String(64), default="Antarctic-2026.1")
