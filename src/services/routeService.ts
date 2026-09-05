import { RouteOption, VesselTelemetry } from "./types";

export const DEFAULT_VESSEL: VesselTelemetry = {
  id: "VESSEL-POLARIS-5",
  name: "R/V POLARIS V",
  callsign: "V7PK9",
  flag: "NO (Norway)",
  iceClass: "Polar Class 3 (PC3) Icebreaker",
  lengthM: 128,
  beamM: 22.4,
  draftM: 8.4,
  speedKnots: 11.4,
  headingDeg: 142,
  currentLat: -63.4,
  currentLng: -57.2,
  destination: "McMurdo Station / Ross Sea",
  departurePoint: "Punta Arenas, Chile",
  eta: "2026-09-12T16:00:00Z",
  fuelReservePercent: 79,
  hullStressIndex: 28, // scale 0 - 100
  iceBeltReinforcement: "55mm Hardox Polar Grade Steel",
  satelliteUplinkQuality: 98,
};

export const MOCK_ROUTES: RouteOption[] = [
  {
    id: "route-balanced",
    name: "BALANCED AI ROUTE",
    tagline: "Recommended: Pareto-Optimal Safety & Speed Tradeoff",
    type: "balanced",
    isRecommended: true,
    distanceNm: 1260,
    estimatedHours: 106,
    riskScore: 41,
    iceExposurePercent: 18,
    icebergEncounterProbability: 14,
    fuelTons: 44.2,
    safetyBufferNm: 28,
    color: "#00F0FF",
    hazardSummary: "Passes 28 nm west of A23A projected 48h zone; navigates open shear leads in King George Basin.",
    waypoints: [
      { lat: -63.40, lng: -57.20, name: "Current Position (Bransfield Strait)", speedLimitKnots: 11.4 },
      { lat: -62.10, lng: -53.40, name: "Joiner Passage Waypoint", speedLimitKnots: 12.0 },
      { lat: -60.90, lng: -50.80, name: "A23A Western Bypass Apex", speedLimitKnots: 9.5 },
      { lat: -59.40, lng: -47.20, name: "Scotia Sea Open Lead Entrance", speedLimitKnots: 12.5 },
      { lat: -57.80, lng: -43.50, name: "Deep Water Corridor Alpha", speedLimitKnots: 13.0 },
      { lat: -56.20, lng: -39.80, name: "South Georgia Gateway", speedLimitKnots: 13.2 },
    ],
  },
  {
    id: "route-safe",
    name: "SAFE ROUTE",
    tagline: "Maximum Distance From Tabular Bergs & Heavy Pack Ice",
    type: "safe",
    isRecommended: false,
    distanceNm: 1420,
    estimatedHours: 124,
    riskScore: 24,
    iceExposurePercent: 6,
    icebergEncounterProbability: 4,
    fuelTons: 48.6,
    safetyBufferNm: 52,
    color: "#10B981",
    hazardSummary: "Wide northern circumnavigation avoiding all projected iceberg debris fields and marginal pack ice.",
    waypoints: [
      { lat: -63.40, lng: -57.20, name: "Current Position", speedLimitKnots: 11.4 },
      { lat: -61.50, lng: -56.80, name: "Drake Passage Outer Lane", speedLimitKnots: 11.5 },
      { lat: -58.80, lng: -53.50, name: "Elephant Island North Clearance", speedLimitKnots: 12.0 },
      { lat: -57.40, lng: -48.00, name: "Scotia Basin Northern Vector", speedLimitKnots: 12.5 },
      { lat: -56.20, lng: -39.80, name: "South Georgia Gateway", speedLimitKnots: 13.0 },
    ],
  },
  {
    id: "route-fast",
    name: "FAST ROUTE",
    tagline: "Direct Geodesic Line - Significant Ice Pack Traversal",
    type: "fast",
    isRecommended: false,
    distanceNm: 1180,
    estimatedHours: 96,
    riskScore: 78,
    iceExposurePercent: 44,
    icebergEncounterProbability: 64,
    fuelTons: 54.8,
    safetyBufferNm: 9,
    color: "#EF4444",
    hazardSummary: "Transits high concentration pack ice near A23A drift corridor. High likelihood of ice compression and hull friction.",
    waypoints: [
      { lat: -63.40, lng: -57.20, name: "Current Position", speedLimitKnots: 11.4 },
      { lat: -61.80, lng: -51.20, name: "Weddell Marginal Lead", speedLimitKnots: 8.5 },
      { lat: -60.60, lng: -46.50, name: "A23A Proximity Sector (High Risk)", speedLimitKnots: 7.0 },
      { lat: -58.20, lng: -42.10, name: "Clarence Channel Exit", speedLimitKnots: 10.0 },
      { lat: -56.20, lng: -39.80, name: "South Georgia Gateway", speedLimitKnots: 13.0 },
    ],
  },
];

import { apiFetch } from "./apiClient";

export async function getVesselTelemetry(): Promise<VesselTelemetry> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return { ...DEFAULT_VESSEL };
}

export async function getRouteOptions(params?: {
  startLat?: number;
  startLng?: number;
  destLat?: number;
  destLng?: number;
  vesselIceClass?: string;
  maxRiskScore?: number;
}): Promise<RouteOption[]> {
  try {
    const payload = {
      startLat: params?.startLat ?? -63.4,
      startLng: params?.startLng ?? -57.2,
      destLat: params?.destLat ?? -56.2,
      destLng: params?.destLng ?? -39.8,
      vesselSpeed: DEFAULT_VESSEL.speedKnots,
      vesselIceClass: params?.vesselIceClass ?? DEFAULT_VESSEL.iceClass,
      maxRiskScore: params?.maxRiskScore ?? 65,
    };

    const routes = await apiFetch<RouteOption[]>("/routes/optimize", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (routes && Array.isArray(routes) && routes.length > 0) {
      return routes;
    }
  } catch (error) {
    console.warn("[ICEGUARD] Live route optimization failed, using local routes:", error);
  }

  return [...MOCK_ROUTES];
}

export async function generateCustomRoute(params: {
  startLat: number;
  startLng: number;
  destLat: number;
  destLng: number;
  vesselIceClass: string;
  maxRiskScore: number;
}): Promise<RouteOption[]> {
  return getRouteOptions(params);
}
