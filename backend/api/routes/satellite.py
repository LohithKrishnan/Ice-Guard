"""
Satellite Remote Sensing Telemetry Endpoint - ICEGUARD AI
"""

from fastapi import APIRouter
import os
import pandas as pd

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed"))
router = APIRouter(prefix="/satellite", tags=["Satellite"])

@router.get("")
def get_satellite_passes():
    csv_file = os.path.join(PROCESSED_DIR, "satellite_processed.csv")
    if os.path.exists(csv_file):
        df = pd.read_csv(csv_file)
        passes = []
        for _, row in df.iterrows():
            passes.append({
                "id": row["pass_id"],
                "name": f"{row['satellite']} {row['sector']}",
                "satellite": row["satellite"],
                "sensorType": row["sensor"],
                "orbitPass": row["orbit_pass"],
                "acquisitionTime": row["acquisition_time"],
                "coverageSqKm": float(row["coverage_sq_km"]),
                "resolutionM": float(row["resolution_m"]),
                "cloudCoveragePercent": float(row["cloud_coverage_percent"]),
                "dataQualityPercent": float(row["data_quality_percent"]),
                "swathWidthKm": float(row["swath_width_km"]),
                "imageryType": "Synthetic Aperture Radar (SAR)" if "SAR" in row["sensor"] else "True Color RGB",
                "spectralBands": row["polarization"],
                "data_provenance": row.get("data_provenance", "REAL DATA (Copernicus Sentinel)"),
            })
        return passes

    return []
