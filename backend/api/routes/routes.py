"""
Route Optimization Endpoint - ICEGUARD AI
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ...services.route_optimizer import RouteOptimizer

router = APIRouter(prefix="/routes", tags=["Routes"])

class RouteOptimizationRequest(BaseModel):
    startLat: float = -63.4
    startLng: float = -57.2
    destLat: float = -56.2
    destLng: float = -39.8
    vesselSpeed: float = 11.4
    vesselIceClass: str = "Polar Class 3 (PC3)"
    maxRiskScore: int = 65

@router.post("/optimize")
def optimize_maritime_route(req: RouteOptimizationRequest):
    optimizer = RouteOptimizer()
    routes = optimizer.optimize_routes(
        start_lat=req.startLat,
        start_lon=req.startLng,
        dest_lat=req.destLat,
        dest_lon=req.destLng,
        vessel_speed_knots=req.vesselSpeed,
        vessel_ice_class=req.vesselIceClass,
        max_acceptable_risk=req.maxRiskScore,
    )
    return routes
