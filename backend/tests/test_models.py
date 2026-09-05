"""
Automated Tests: Machine Learning Inference & Uncertainty - ICEGUARD AI
"""

import pytest
from ..ml.sea_ice.predict import predict_sea_ice_concentration
from ..ml.iceberg_trajectory.predict import predict_iceberg_trajectory
from ..ml.features.spatial import project_waypoint, coriolis_parameter

def test_sea_ice_prediction():
    res = predict_sea_ice_concentration(
        latitude=-62.5,
        longitude=-51.8,
        current_concentration=74.0,
        thickness_m=1.8,
    )
    assert "predictions" in res
    assert "24h" in res["predictions"]
    assert "48h" in res["predictions"]
    assert "72h" in res["predictions"]

    p24 = res["predictions"]["24h"]
    assert 0.0 <= p24["concentration_percent"] <= 100.0
    assert p24["confidence_percent"] > 80.0
    assert "REAL DATA" in res["data_provenance"]

def test_iceberg_trajectory_prediction_and_uncertainty():
    res = predict_iceberg_trajectory(
        iceberg_id="A23A",
        latitude=-60.85,
        longitude=-48.20,
        drift_speed_knots=0.34,
        drift_heading_deg=127.0,
    )
    assert res["iceberg_id"] == "A23A"
    assert len(res["trajectory"]) == 4  # 24h, 48h, 72h, 168h
    assert res["forecast_hours"] == [24, 48, 72, 168]

    # Check uncertainty cone increases over time
    r24 = res["trajectory"][0]["uncertainty_radius_km"]
    r48 = res["trajectory"][1]["uncertainty_radius_km"]
    r72 = res["trajectory"][2]["uncertainty_radius_km"]
    r7d = res["trajectory"][3]["uncertainty_radius_km"]

    assert r24 < r48 < r72 < r7d
    assert 5.0 <= r24 <= 9.0
    assert 30.0 <= r7d <= 65.0

def test_coriolis_and_projection():
    f = coriolis_parameter(-60.0)
    # Coriolis is negative in the southern hemisphere
    assert f < 0.0

    # Projecting 111 km north from -61° should land at approx -60°
    new_lat, new_lon = project_waypoint(-61.0, 0.0, 111.12, 0.0)
    assert abs(new_lat - (-60.0)) < 0.1
