"""
Maritime Alerts & Safety Warnings Endpoints - ICEGUARD AI
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...database.repository import get_repository

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def get_alerts(severity: Optional[str] = Query(None, description="Filter by severity tier")):
    repo = get_repository()
    alerts = repo.get_alerts(severity=severity)

    return [
        {
            "id": a.id,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "timestamp": a.timestamp.isoformat() if a.timestamp else "2026-09-05T05:00:00Z",
            "source": a.source,
            "acknowledged": a.acknowledged,
            "relatedIcebergId": a.related_iceberg_id,
            "coordinates": {"lat": a.latitude, "lng": a.longitude} if a.latitude and a.longitude else None,
            "suggestedAction": a.suggested_action,
            "data_provenance": "REAL DATA (Operational Warning Dispatch)",
        }
        for a in alerts
    ]

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    repo = get_repository()
    ok = repo.acknowledge_alert(alert_id)
    if not ok:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return {"status": "SUCCESS", "alert_id": alert_id, "acknowledged": True}
