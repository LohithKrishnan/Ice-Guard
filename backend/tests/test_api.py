"""
Automated End-to-End API Integration Tests - ICEGUARD AI
"""

import pytest
from fastapi.testclient import TestClient
from ..api.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert "sea_ice_model" in data["services"]

def test_api_sea_ice():
    res_curr = client.get("/api/sea-ice/current")
    assert res_curr.status_code == 200
    data_curr = res_curr.json()
    assert "overallCoveragePercent" in data_curr
    assert len(data_curr["concentrationZones"]) > 0

    res_fc = client.get("/api/sea-ice/forecast?lat=-62.5&lon=-51.8")
    assert res_fc.status_code == 200
    data_fc = res_fc.json()
    assert "local_forecast" in data_fc
    assert "forecastTimeline" in data_fc

def test_api_icebergs():
    res_list = client.get("/api/icebergs")
    assert res_list.status_code == 200
    bergs = res_list.json()
    assert len(bergs) >= 6
    assert any(b["id"] == "A23A" for b in bergs)

    res_detail = client.get("/api/icebergs/A23A")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["id"] == "A23A"
    assert "predictions" in detail

    res_traj = client.get("/api/icebergs/A23A/trajectory")
    assert res_traj.status_code == 200
    traj = res_traj.json()
    assert traj["iceberg_id"] == "A23A"
    assert len(traj["trajectory"]) == 4

def test_api_risk():
    payload = {
        "latitude": -63.4,
        "longitude": -57.2,
        "vessel_speed_knots": 11.4,
        "vessel_ice_class": "Polar Class 3 (PC3)",
        "wind_speed_knots": 24.0,
    }
    res = client.post("/api/risk", json=payload)
    assert res.status_code == 200
    risk = res.json()
    assert "overall" in risk
    assert "status" in risk
    assert "iceberg" in risk

def test_api_routes_optimize():
    payload = {
        "startLat": -63.4,
        "startLng": -57.2,
        "destLat": -56.2,
        "destLng": -39.8,
        "vesselSpeed": 11.4,
        "vesselIceClass": "Polar Class 3 (PC3)",
        "maxRiskScore": 65,
    }
    res = client.post("/api/routes/optimize", json=payload)
    assert res.status_code == 200
    routes = res.json()
    assert len(routes) == 3

def test_api_satellite_and_models():
    res_sat = client.get("/api/satellite")
    assert res_sat.status_code == 200
    sat_passes = res_sat.json()
    assert len(sat_passes) >= 4

    res_models = client.get("/api/models/status")
    assert res_models.status_code == 200
    models = res_models.json()
    assert len(models) == 5

    res_metrics = client.get("/api/models/metrics")
    assert res_metrics.status_code == 200

def test_api_copilot():
    payload = {"query": "Which iceberg is closest to the vessel?"}
    res = client.post("/api/copilot", json=payload)
    assert res.status_code == 200
    copilot_resp = res.json()
    assert "Nearest Tracked" in copilot_resp["text"]
    assert copilot_resp["actionButton"] is not None

def test_api_alerts_and_acknowledge():
    res_alerts = client.get("/api/alerts")
    assert res_alerts.status_code == 200
    alerts = res_alerts.json()
    assert len(alerts) >= 6

    alert_id = alerts[0]["id"]
    res_ack = client.post(f"/api/alerts/{alert_id}/acknowledge")
    assert res_ack.status_code == 200
    assert res_ack.json()["acknowledged"] is True
