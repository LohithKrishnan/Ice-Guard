"""
Sea-Ice Concentration ML Model Training Pipeline - ICEGUARD AI
Trains a Multi-Horizon Gradient Boosting Regressor with Chronological Splitting.
"""

import os
import json
from datetime import datetime, timezone
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from ..features.sea_ice_features import (
    generate_sea_ice_features,
    FEATURE_COLUMNS,
    TARGET_COLUMNS,
)

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "sea_ice_processed.csv"))
ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "sea_ice_model.joblib")
METRICS_PATH = os.path.join(ARTIFACTS_DIR, "sea_ice_metrics.json")

def train_sea_ice_model():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    print("Loading processed Antarctic sea-ice observations...")
    raw_df = pd.read_csv(DATA_PATH)
    featured_df = generate_sea_ice_features(raw_df)

    # Chronological train/validation split (no data leakage)
    split_idx = int(len(featured_df) * 0.8)
    train_df = featured_df.iloc[:split_idx]
    test_df = featured_df.iloc[split_idx:]

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMNS]

    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMNS]

    print(f"Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # Multi-output Gradient Boosting Regressor
    base_estimator = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.08,
        max_depth=4,
        random_state=42
    )
    model = MultiOutputRegressor(base_estimator)
    model.fit(X_train, y_train)

    # Evaluate on held-out test data
    y_pred = model.predict(X_test)

    metrics = {}
    horizons = ["24h", "48h", "72h"]

    for i, h in enumerate(horizons):
        mae = float(mean_absolute_error(y_test.iloc[:, i], y_pred[:, i]))
        rmse = float(np.sqrt(mean_squared_error(y_test.iloc[:, i], y_pred[:, i])))
        r2 = float(r2_score(y_test.iloc[:, i], y_pred[:, i]))

        metrics[f"mae_{h}"] = round(mae, 3)
        metrics[f"rmse_{h}"] = round(rmse, 3)
        metrics[f"r2_{h}"] = round(r2, 3)

    summary_metrics = {
        "model_name": "Antarctic Sea-Ice Multi-Horizon Gradient Booster",
        "model_version": "v3.4.1",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "horizons": horizons,
        "metrics": metrics,
        "mean_r2": round(float(np.mean([metrics[f"r2_{h}"] for h in horizons])), 3),
        "mean_mae_percent": round(float(np.mean([metrics[f"mae_{h}"] for h in horizons])), 3),
        "data_provenance": "REAL DATA (NSIDC AMSR2 Reanalysis)",
    }

    print("Evaluation Results on Held-out Chronological Test Set:")
    for k, v in metrics.items():
        print(f"  {k}: {v}")

    # Save model and metrics artifacts
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(summary_metrics, f, indent=2)

    print(f"Model saved to {MODEL_PATH}")
    print(f"Metrics saved to {METRICS_PATH}")
    return model, summary_metrics

if __name__ == "__main__":
    train_sea_ice_model()
