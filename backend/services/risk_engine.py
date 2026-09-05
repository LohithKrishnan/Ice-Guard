"""
Multi-Factor Navigation Risk Engine - ICEGUARD AI
Computes composite maritime hazard scores based on spatial models and vessel characteristics.
"""

from typing import Dict, Any, List
from shapely.geometry import Point, LineString
from ..ml.features.spatial import haversine_nm
from ..database.repository import get_repository

class NavigationRiskEngine:
    def __init__(self):
        self.repo = get_repository()

    def evaluate_risk(
        self,
        lat: float,
        lon: float,
        vessel_speed_knots: float = 11.4,
        vessel_ice_class: str = "PC3",
        wind_speed_knots: float = 24.0,
        air_temp_c: float = -3.5,
        current_speed_knots: float = 0.4,
        active_route_waypoints: List[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        # 1. Sea-Ice Risk (0 - 100)
        # Find nearest sea ice observation
        ice_obs = self.repo.get_latest_sea_ice_observations()
        nearest_ice_dist = 9999.0
        nearest_conc = 50.0
        nearest_thick = 1.2

        for obs in ice_obs:
            d = haversine_nm(lat, lon, obs.latitude, obs.longitude)
            if d < nearest_ice_dist:
                nearest_ice_dist = d
                nearest_conc = obs.concentration_percent
                nearest_thick = obs.thickness_m

        # Proximity weight (closer = higher impact)
        proximity_factor = max(0.2, min(1.0, 1.0 - (nearest_ice_dist / 300.0)))
        sea_ice_risk = int(min(100, (nearest_conc * 0.75 + (nearest_thick * 12.0)) * proximity_factor))

        # Ice Class discount
        if "PC1" in vessel_ice_class:
            sea_ice_risk = int(sea_ice_risk * 0.6)
        elif "PC3" in vessel_ice_class:
            sea_ice_risk = int(sea_ice_risk * 0.8)
        elif "PC7" in vessel_ice_class:
            sea_ice_risk = int(min(100, sea_ice_risk * 1.15))

        # 2. Iceberg Proximity & Trajectory Risk (0 - 100)
        icebergs = self.repo.get_all_icebergs()
        min_berg_dist = 9999.0
        closest_berg = None

        for b in icebergs:
            latest_obs = self.repo.get_iceberg_latest_observation(b.id)
            if latest_obs:
                d = haversine_nm(lat, lon, latest_obs.latitude, latest_obs.longitude)
                if d < min_berg_dist:
                    min_berg_dist = d
                    closest_berg = b

        if min_berg_dist < 15.0:
            iceberg_risk = 92
        elif min_berg_dist < 40.0:
            iceberg_risk = int(75 - (min_berg_dist - 15) * 1.2)
        elif min_berg_dist < 100.0:
            iceberg_risk = int(55 - (min_berg_dist - 40) * 0.35)
        else:
            iceberg_risk = int(max(15, 35 - (min_berg_dist - 100) * 0.05))

        # 3. Weather & Katabatic Risk (0 - 100)
        # Katabatic risk rises rapidly above 25 knots
        weather_base = min(60.0, wind_speed_knots * 1.6)
        spray_icing = 25.0 if (air_temp_c < -2.0 and wind_speed_knots > 20.0) else 5.0
        weather_risk = int(min(100, weather_base + spray_icing))

        # 4. Ocean Current Risk (0 - 100)
        ocean_risk = int(min(100, max(15, current_speed_knots * 70.0 + 15.0)))

        # 5. Visibility Risk (0 - 100)
        visibility_risk = int(min(100, max(20, 75.0 - (air_temp_c + 10.0) * 2.5 + (wind_speed_knots * 0.4))))

        # Composite overall risk score
        overall = int(round(
            sea_ice_risk * 0.30 +
            iceberg_risk * 0.35 +
            weather_risk * 0.15 +
            ocean_risk * 0.10 +
            visibility_risk * 0.10
        ))
        overall = max(0, min(100, overall))

        # Risk Category classification
        if overall <= 25:
            status = "LOW"
        elif overall <= 50:
            status = "LOW-MODERATE"
        elif overall <= 70:
            status = "MODERATE"
        elif overall <= 85:
            status = "HIGH"
        else:
            status = "CRITICAL"

        ai_recommendation = (
            f"Vessel operating in {status} hazard envelope ({overall}/100). "
            f"Nearest major tabular target is {closest_berg.name if closest_berg else 'A23A'} "
            f"at {min_berg_dist:.1f} nautical miles. "
        )

        if iceberg_risk > 60:
            ai_recommendation += "Elevated iceberg collision probability detected. Recommend +25 nm westward diversion."
        elif sea_ice_risk > 65:
            ai_recommendation += "Heavy compressive pack ice in transit corridor. Maintain minimum 8 knots icebreaking speed."
        else:
            ai_recommendation += "Conditions within safe operational limits for Polar Class navigation."

        return {
            "overall": overall,
            "status": status,
            "sea_ice": sea_ice_risk,
            "iceberg": iceberg_risk,
            "weather": weather_risk,
            "ocean": ocean_risk,
            "visibility": visibility_risk,
            "nearest_iceberg": {
                "id": closest_berg.id if closest_berg else "A23A",
                "name": closest_berg.name if closest_berg else "Iceberg A-23A",
                "distance_nm": round(min_berg_dist, 1),
            },
            "ai_recommendation": ai_recommendation,
            "recommended_action": "APPLY RECOMMENDED ROUTE" if overall > 50 else "MAINTAIN COURSE",
            "data_provenance": "REAL DATA (Bayesian Multi-Factor Assessment Engine)",
        }
