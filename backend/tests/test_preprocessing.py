"""
Automated Tests: Data Ingestion & Preprocessing - ICEGUARD AI
"""

import os
import pandas as pd
import pytest
from ..data_ingestion.sea_ice import ingest_sea_ice_data
from ..data_ingestion.iceberg import ingest_iceberg_data, haversine_distance_nm, initial_bearing_deg
from ..data_ingestion.weather import ingest_weather_data
from ..data_ingestion.ocean import ingest_ocean_data

def test_sea_ice_ingestion():
    df = ingest_sea_ice_data(force_reingest=False)
    assert not df.empty
    assert "concentration_percent" in df.columns
    assert "thickness_m" in df.columns
    # Coordinate boundary checks for Antarctic waters
    assert (df["latitude"] >= -90.0).all() and (df["latitude"] <= -50.0).all()
    assert (df["concentration_percent"] >= 0.0).all() and (df["concentration_percent"] <= 100.0).all()
    assert "REAL DATA" in df["data_provenance"].iloc[0]

def test_iceberg_ingestion():
    df = ingest_iceberg_data(force_reingest=False)
    assert not df.empty
    assert "iceberg_id" in df.columns
    assert "drift_speed_knots" in df.columns
    assert "A23A" in df["iceberg_id"].values
    assert (df["drift_speed_knots"] >= 0.0).all()

def test_weather_and_ocean_ingestion():
    df_w = ingest_weather_data(force_reingest=False)
    assert not df_w.empty
    assert "wind_speed_knots" in df_w.columns
    assert (df_w["wind_speed_knots"] >= 0.0).all()

    df_o = ingest_ocean_data(force_reingest=False)
    assert not df_o.empty
    assert "current_speed_knots" in df_o.columns

def test_geodesic_math():
    # Distance between -60°S 0°E and -61°S 0°E is approx 60 nautical miles
    dist = haversine_distance_nm(-60.0, 0.0, -61.0, 0.0)
    assert 59.0 <= dist <= 61.0

    bearing = initial_bearing_deg(-60.0, 0.0, -61.0, 0.0)
    assert abs(bearing - 180.0) < 1.0  # Due South is 180°
