"""
Geospatial & Polar Kinematic Utilities - ICEGUARD AI
Calculates nautical distances, bearings, waypoint projections, and Coriolis parameters.
"""

import math
from typing import Tuple

EARTH_RADIUS_KM = 6371.0088
EARTH_RADIUS_NM = 3440.065
OMEGA_EARTH = 7.2921159e-5  # Earth rotation rate in rad/s

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2)**2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(max(0.0, min(1.0, a))))

def haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    return haversine_km(lat1, lon1, lat2, lon2) / 1.852

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlam = math.radians(lon2 - lon1)
    y = math.sin(dlam) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlam)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360.0) % 360.0

def project_waypoint(lat: float, lon: float, distance_km: float, bearing_deg: float) -> Tuple[float, float]:
    delta = distance_km / EARTH_RADIUS_KM
    theta = math.radians(bearing_deg)
    phi1 = math.radians(lat)
    lambda1 = math.radians(lon)

    sin_phi2 = math.sin(phi1) * math.cos(delta) + math.cos(phi1) * math.sin(delta) * math.cos(theta)
    phi2 = math.asin(max(-1.0, min(1.0, sin_phi2)))

    y = math.sin(theta) * math.sin(delta) * math.cos(phi1)
    x = math.cos(delta) - math.sin(phi1) * math.sin(phi2)
    lambda2 = lambda1 + math.atan2(y, x)

    # Normalize longitude to [-180, 180]
    lon2 = (math.degrees(lambda2) + 540.0) % 360.0 - 180.0
    return round(math.degrees(phi2), 4), round(lon2, 4)

def coriolis_parameter(lat: float) -> float:
    """Calculates Coriolis parameter f = 2 * Omega * sin(phi) in s^-1."""
    return 2.0 * OMEGA_EARTH * math.sin(math.radians(lat))

def distance_to_pole_km(lat: float) -> float:
    """Distance from South Pole (-90°)."""
    return haversine_km(-90.0, 0.0, lat, 0.0)
