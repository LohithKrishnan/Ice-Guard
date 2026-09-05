"""
Navigation Risk Evaluation Endpoint - ICEGUARD AI
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict
from ...services.risk_engine import NavigationRiskEngine

router = APIRouter(prefix="/risk", tags=["Risk"])

class RiskEvaluationRequest(BaseModel):
    latitude: float = -63.4
    longitude: float = -57.2
    vessel_speed_knots: float = 11.4
    vessel_ice_class: str = "Polar Class 3 (PC3)"
    wind_speed_knots: float = 24.0
    air_temp_c: float = -3.5
    current_speed_knots: float = 0.4
    waypoints: Optional[List[Dict[str, float]]] = None

@router.post("")
def evaluate_navigation_risk(req: RiskEvaluationRequest):
    engine = NavigationRiskEngine()
    result = engine.evaluate_risk(
        lat=req.latitude,
        lon=req.longitude,
        vessel_speed_knots=req.vessel_speed_knots,
        vessel_ice_class=req.vessel_ice_class,
        wind_speed_knots=req.wind_speed_knots,
        air_temp_c=req.air_temp_c,
        current_speed_knots=req.current_speed_knots,
        active_route_waypoints=req.waypoints,
    )
    return result
