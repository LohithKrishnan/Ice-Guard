"""
Sea-Ice Feature Engineering Pipeline - ICEGUARD AI
Generates temporal lags, spatial coordinates, rolling statistics, and seasonal harmonic embeddings.
"""

import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "latitude",
    "longitude",
    "dist_to_pole_deg",
    "doy_sin",
    "doy_cos",
    "conc_lag_1d",
    "conc_lag_2d",
    "conc_lag_3d",
    "conc_rolling_mean_7d",
    "conc_rolling_std_7d",
    "thickness_m",
    "surface_temp_c",
    "wind_speed_knots",
]

TARGET_COLUMNS = [
    "target_conc_24h",
    "target_conc_48h",
    "target_conc_72h",
]

def generate_sea_ice_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by=["sector_name", "timestamp"]).reset_index(drop=True)

    # Cyclical day of year
    doy = df["timestamp"].dt.dayofyear
    df["doy_sin"] = np.sin(2.0 * np.pi * doy / 365.25)
    df["doy_cos"] = np.cos(2.0 * np.pi * doy / 365.25)

    # Distance to pole in degrees latitude
    df["dist_to_pole_deg"] = 90.0 + df["latitude"]

    # Grouped lag features per sector
    grouped = df.groupby("sector_name")
    df["conc_lag_1d"] = grouped["concentration_percent"].shift(1)
    df["conc_lag_2d"] = grouped["concentration_percent"].shift(2)
    df["conc_lag_3d"] = grouped["concentration_percent"].shift(3)

    # Rolling statistics
    df["conc_rolling_mean_7d"] = grouped["concentration_percent"].transform(
        lambda x: x.rolling(7, min_periods=1).mean()
    )
    df["conc_rolling_std_7d"] = grouped["concentration_percent"].transform(
        lambda x: x.rolling(7, min_periods=1).std().fillna(0.0)
    )

    # Multi-horizon prediction targets (+1d, +2d, +3d = +24h, +48h, +72h)
    df["target_conc_24h"] = grouped["concentration_percent"].shift(-1)
    df["target_conc_48h"] = grouped["concentration_percent"].shift(-2)
    df["target_conc_72h"] = grouped["concentration_percent"].shift(-3)

    # Drop rows with NaN lags or targets
    df = df.dropna(subset=FEATURE_COLUMNS + TARGET_COLUMNS).reset_index(drop=True)
    return df
