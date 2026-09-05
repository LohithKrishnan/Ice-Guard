import { SimulationStep, Iceberg, VesselTelemetry, RiskAssessment } from "./types";
import { MOCK_ICEBERGS } from "./icebergService";
import { DEFAULT_VESSEL, MOCK_ROUTES } from "./routeService";
import { MOCK_RISK_ASSESSMENT } from "./riskService";

export interface SimulationSnapshot {
  step: SimulationStep;
  hoursOffset: number;
  timestamp: string;
  icebergs: Iceberg[];
  vessel: VesselTelemetry;
  riskAssessment: RiskAssessment;
  activeAlertCount: number;
}

export function getSimulationSnapshot(step: SimulationStep, activeRouteId: string = "route-balanced"): SimulationSnapshot {
  const baseTime = new Date("2026-09-05T05:00:00Z");
  let hours = 0;
  let key: "24h" | "48h" | "72h" | "7d" | null = null;

  switch (step) {
    case "T+24h":
      hours = 24;
      key = "24h";
      break;
    case "T+48h":
      hours = 48;
      key = "48h";
      break;
    case "T+72h":
      hours = 72;
      key = "72h";
      break;
    case "T+7d":
      hours = 168;
      key = "7d";
      break;
    case "T+0":
    default:
      hours = 0;
      key = null;
      break;
  }

  const simTime = new Date(baseTime.getTime() + hours * 3600 * 1000).toISOString();

  // Icebergs shifted
  const shiftedIcebergs = MOCK_ICEBERGS.map((berg) => {
    if (!key) return { ...berg };
    const pred = berg.predictions[key];
    return {
      ...berg,
      latitude: pred.lat,
      longitude: pred.lng,
      driftSpeedKnots: pred.speedKnots,
      driftDirectionDeg: pred.headingDeg,
    };
  });

  // Shift vessel along active route
  const activeRoute = MOCK_ROUTES.find((r) => r.id === activeRouteId) || MOCK_ROUTES[0];
  const waypoints = activeRoute.waypoints;
  const numSegments = waypoints.length - 1;
  const progressRatio = Math.min(1, (hours * DEFAULT_VESSEL.speedKnots) / activeRoute.distanceNm);
  const targetIndex = Math.min(numSegments - 1, Math.floor(progressRatio * numSegments));
  const segmentFraction = (progressRatio * numSegments) - targetIndex;

  const p1 = waypoints[targetIndex];
  const p2 = waypoints[Math.min(numSegments, targetIndex + 1)];

  const curLat = p1.lat + (p2.lat - p1.lat) * segmentFraction;
  const curLng = p1.lng + (p2.lng - p1.lng) * segmentFraction;

  const shiftedVessel: VesselTelemetry = {
    ...DEFAULT_VESSEL,
    currentLat: Number(curLat.toFixed(3)),
    currentLng: Number(curLng.toFixed(3)),
    fuelReservePercent: Math.max(20, Math.round(DEFAULT_VESSEL.fuelReservePercent - (hours * 0.4))),
    hullStressIndex: activeRoute.type === "fast" ? Math.min(85, 28 + hours * 0.7) : Math.max(15, 28 - hours * 0.1),
  };

  // Dynamic risk score
  let dynamicRisk = MOCK_RISK_ASSESSMENT.overallRiskScore;
  if (activeRoute.type === "fast") {
    dynamicRisk = Math.min(95, Math.round(64 + hours * 0.45));
  } else if (activeRoute.type === "safe") {
    dynamicRisk = Math.max(18, Math.round(24 - hours * 0.08));
  } else {
    // Balanced route lowers risk as it clears the convergence zone
    dynamicRisk = Math.max(25, Math.round(41 - hours * 0.18));
  }

  const updatedRisk: RiskAssessment = {
    ...MOCK_RISK_ASSESSMENT,
    overallRiskScore: dynamicRisk,
    status: dynamicRisk >= 75 ? "CRITICAL" : dynamicRisk >= 55 ? "ELEVATED" : dynamicRisk >= 35 ? "MODERATE" : "LOW",
    icebergRisk: activeRoute.type === "fast" ? Math.min(92, 72 + hours * 0.3) : Math.max(20, 72 - hours * 0.6),
  };

  return {
    step,
    hoursOffset: hours,
    timestamp: simTime,
    icebergs: shiftedIcebergs,
    vessel: shiftedVessel,
    riskAssessment: updatedRisk,
    activeAlertCount: dynamicRisk > 60 ? 4 : 2,
  };
}
