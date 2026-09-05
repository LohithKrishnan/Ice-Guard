"""
Automated Tests: Navigation Risk & Route Optimization - ICEGUARD AI
"""

import pytest
from ..services.risk_engine import NavigationRiskEngine
from ..services.route_optimizer import RouteOptimizer
from ..services.copilot_reasoner import CopilotReasoner

def test_navigation_risk_evaluation():
    engine = NavigationRiskEngine()
    risk = engine.evaluate_risk(
        lat=-63.4,
        lon=-57.2,
        vessel_speed_knots=11.4,
        vessel_ice_class="Polar Class 3 (PC3)",
        wind_speed_knots=24.0,
    )
    assert "overall" in risk
    assert 0 <= risk["overall"] <= 100
    assert risk["status"] in ["LOW", "LOW-MODERATE", "MODERATE", "HIGH", "CRITICAL"]
    assert 0 <= risk["sea_ice"] <= 100
    assert 0 <= risk["iceberg"] <= 100
    assert 0 <= risk["weather"] <= 100

def test_route_optimizer():
    optimizer = RouteOptimizer()
    routes = optimizer.optimize_routes(
        start_lat=-63.4,
        start_lon=-57.2,
        dest_lat=-56.2,
        dest_lon=-39.8,
        vessel_speed_knots=11.4,
    )
    assert len(routes) == 3
    route_types = [r["type"] for r in routes]
    assert "safe" in route_types
    assert "fast" in route_types
    assert "balanced" in route_types

    balanced = next(r for r in routes if r["type"] == "balanced")
    safe = next(r for r in routes if r["type"] == "safe")
    fast = next(r for r in routes if r["type"] == "fast")

    assert safe["riskScore"] <= balanced["riskScore"] <= fast["riskScore"]
    assert fast["distanceNm"] <= balanced["distanceNm"] <= safe["distanceNm"]

def test_copilot_reasoner():
    reasoner = CopilotReasoner()
    res1 = reasoner.process_query("Is my current route safe?")
    assert "Route Risk Assessment" in res1["text"]
    assert res1["actionButton"] is not None

    res2 = reasoner.process_query("Predict A23A movement for 72 hours.")
    assert "A23A" in res2["text"]
    assert "Uncertainty" in res2["text"]
