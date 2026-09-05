"""
Iceberg Trajectory Feature Engineering - ICEGUARD AI
Couples hydrodynamic forces, Coriolis effect, ocean currents, and kinematic states.
"""

import numpy as np
import pandas as pd
from .spatial import coriolis_parameter

TRAJECTORY_FEATURES = [
    "latitude",
    "longitude",
    "drift_speed_knots",
    "heading_sin",
    "heading_cos",
    "vel_u_knots",
    "vel_v_knots",
    "coriolis_f",
    "length_km",
    "width_km",
    "thickness_m",
    "mass_gt",
]

TARGET_HORIZONS = ["24h", "48h", "72h", "7d"]

def generate_trajectory_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by=["iceberg_id", "timestamp"]).reset_index(drop=True)

    # Heading cyclic encoding
    rad = np.radians(df["drift_heading_deg"])
    df["heading_sin"] = np.sin(rad)
    df["heading_cos"] = np.cos(rad)

    # Velocity components (eastward u, northward v)
    df["vel_u_knots"] = df["drift_speed_knots"] * df["heading_sin"]
    df["vel_v_knots"] = df["drift_speed_knots"] * df["heading_cos"]

    # Coriolis parameter
    df["coriolis_f"] = df["latitude"].apply(coriolis_parameter)

    grouped = df.groupby("iceberg_id")

    # Future displacement targets
    # 24h = 1 step of 1 day (or interpolate from 3-day steps)
    # Our historical tracking interval in ingestion was 3 days. Let's compute targets:
    # shift(-1) is approx 3 days, shift(-2) is 6 days, etc.
    df["dlat_step1"] = grouped["latitude"].shift(-1) - df["latitude"]
    df["dlon_step1"] = grouped["longitude"].shift(-1) - df["longitude"]
    df["dspeed_step1"] = grouped["drift_speed_knots"].shift(-1) - df["drift_speed_knots"]
    df["dheading_step1"] = grouped["drift_heading_deg"].shift(-1) - df["drift_heading_deg"]

    df = df.dropna(subset=TRAJECTORY_FEATURES + ["dlat_step1", "dlon_step1"]).reset_index(drop=True)
    return df
