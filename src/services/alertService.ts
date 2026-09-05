import { MaritimeAlert } from "./types";

export const MOCK_ALERTS: MaritimeAlert[] = [
  {
    id: "alert-001",
    severity: "CRITICAL",
    title: "Iceberg Collision Hazard Detected",
    message: "Iceberg A23A may intersect Route B within 18 hours. Predicted CPA (Closest Point of Approach) is 1.8 nautical miles at 0.38 knots drift. Immediate course adjustment recommended.",
    timestamp: "2026-09-05T05:12:00Z",
    source: "AI Hydrodynamic Trajectory Engine",
    acknowledged: false,
    relatedIcebergId: "A23A",
    coordinates: { lat: -60.85, lng: -48.20 },
    suggestedAction: "Shift to Balanced AI Route (+28 nm clearance)",
  },
  {
    id: "alert-002",
    severity: "CRITICAL",
    title: "Severe Katabatic Storm Front",
    message: "Plateau pressure gradient causing sustained 55 knot katabatic gusts with peak bursts to 72 knots in Bransfield Strait. High risk of vessel superstructure icing.",
    timestamp: "2026-09-05T04:45:00Z",
    source: "Antarctic Mesoscale Prediction System (AMPS)",
    acknowledged: false,
    coordinates: { lat: -63.20, lng: -58.20 },
    suggestedAction: "Activate thermal de-icing coils & adjust vessel trim",
  },
  {
    id: "alert-003",
    severity: "WARNING",
    title: "Pack-Ice Concentration Surge",
    message: "Sea-ice concentration increasing rapidly (+16% in 8 hours) in northern Joiner Passage corridor due to compressive southern swells.",
    timestamp: "2026-09-05T03:30:00Z",
    source: "Sentinel-1 SAR Radar Analysis",
    acknowledged: false,
    coordinates: { lat: -62.10, lng: -53.40 },
    suggestedAction: "Maintain minimum 8 knots icebreaking transit speed",
  },
  {
    id: "alert-004",
    severity: "WARNING",
    title: "Submerged Ice Ram Hazard",
    message: "Sonar profiling detects an extensive underwater ice ram projecting 650m north-northwest from iceberg A76A flank.",
    timestamp: "2026-09-05T02:10:00Z",
    source: "Forward-Looking Sonar Telemetry",
    acknowledged: true,
    relatedIcebergId: "A76A",
    coordinates: { lat: -58.92, lng: -42.15 },
    suggestedAction: "Increase CPA stand-off distance to > 3.0 nm",
  },
  {
    id: "alert-005",
    severity: "ADVISORY",
    title: "Satellite Swath Refreshed",
    message: "Sentinel-1A SAR ascending pass over Weddell Basin received. 14 new sub-kilometer iceberg fragments mapped and cataloged.",
    timestamp: "2026-09-05T01:15:00Z",
    source: "ESA Copernicus Polar Ground Station",
    acknowledged: true,
  },
  {
    id: "alert-006",
    severity: "INFORMATION",
    title: "Polar Code Route Validation",
    message: "IMO Polar Code safety envelope verified for R/V POLARIS V (Polar Class PC3). All hull stress sensors within green threshold.",
    timestamp: "2026-09-05T00:00:00Z",
    source: "Navigation Decision Engine",
    acknowledged: true,
  },
];

import { apiFetch } from "./apiClient";

export async function getAlerts(severity?: string): Promise<MaritimeAlert[]> {
  try {
    const url = severity && severity !== "ALL" ? `/alerts?severity=${severity}` : "/alerts";
    const alerts = await apiFetch<MaritimeAlert[]>(url);
    if (alerts && Array.isArray(alerts) && alerts.length > 0) {
      return alerts;
    }
  } catch (error) {
    console.warn("[ICEGUARD] Live alerts fetch failed, using local alert store:", error);
  }

  return [...MOCK_ALERTS];
}

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    const res = await apiFetch<any>(`/alerts/${alertId}/acknowledge`, {
      method: "POST",
    });
    if (res && (res.status === "SUCCESS" || res.acknowledged)) {
      const local = MOCK_ALERTS.find((a) => a.id === alertId);
      if (local) local.acknowledged = true;
      return true;
    }
  } catch (error) {
    console.warn(`[ICEGUARD] Live alert acknowledge failed for ${alertId}, acknowledging locally:`, error);
  }

  const alert = MOCK_ALERTS.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}
