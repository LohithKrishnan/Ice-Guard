import { RiskAssessment } from "./types";

export const MOCK_RISK_ASSESSMENT: RiskAssessment = {
  overallRiskScore: 64,
  status: "MODERATE",
  seaIceRisk: 58,
  icebergRisk: 72,
  weatherRisk: 61,
  oceanCurrentRisk: 44,
  visibilityRisk: 53,
  riskTrend: "INCREASING",
  lastEvaluated: "2026-09-05T05:15:00Z",
  aiRecommendation:
    "Current active route intersects elevated iceberg drift vector in Sector 4-Bravo within 22 hours. Applying the AI Balanced Route shifts the course 28 nautical miles west, reducing collision probability by 62% while preserving fuel efficiency.",
  recommendedAction: "APPLY RECOMMENDED ROUTE",
  riskZones: [
    {
      id: "risk-zone-1",
      name: "A23A Dynamic Fragment Dispersion Corridor",
      category: "TABULAR_CLUSTER",
      severity: "CRITICAL",
      lat: -60.85,
      lng: -48.20,
      radiusKm: 140,
      description: "High concentration of calved bergy bits, growlers, and multi-year ice floes shedding from A23A eastern flank.",
      hazardNotice: "Radar attenuation in heavy swells; sub-surface ice rams extending up to 800m from visible tabular edge.",
    },
    {
      id: "risk-zone-2",
      name: "Weddell North Pressure Ridge Convergence",
      category: "HEAVY_PACK_ICE",
      severity: "HIGH",
      lat: -62.50,
      lng: -51.80,
      radiusKm: 110,
      description: "Convergent wind-driven pack ice creating multi-year pressure ridges in excess of 4.2 meters thickness.",
      hazardNotice: "Bespoke polar class icebreaker required. High risk of vessel besetting if speed drops below 6 knots.",
    },
    {
      id: "risk-zone-3",
      name: "Bransfield Strait Katabatic Wind Zone",
      category: "KATABATIC_WIND",
      severity: "MODERATE",
      lat: -63.20,
      lng: -58.20,
      radiusKm: 95,
      description: "Sudden downslope gravity winds spilling off the Antarctic Peninsula plateau. Gale force gusts to 65 knots.",
      hazardNotice: "Rapid superstructure sea spray icing risk; reduced vessel stability.",
    },
    {
      id: "risk-zone-4",
      name: "Elephant Island Submerged Pinnacle Cluster",
      category: "SUBMERGED_PINNACLE",
      severity: "HIGH",
      lat: -61.15,
      lng: -54.70,
      radiusKm: 65,
      description: "Uncharted glacial moraine banks with erratic soundings between 12m and 45m.",
      hazardNotice: "Keep at least 15 nm clearance during reduced visibility.",
    },
  ],
};

import { apiFetch } from "./apiClient";

export interface RiskEvaluationParams {
  latitude?: number;
  longitude?: number;
  vessel_speed_knots?: number;
  vessel_ice_class?: string;
  wind_speed_knots?: number;
  air_temp_c?: number;
  current_speed_knots?: number;
  waypoints?: Array<{ lat: number; lng: number }>;
}

export async function getRiskAssessment(params?: RiskEvaluationParams): Promise<RiskAssessment> {
  try {
    const payload = {
      latitude: params?.latitude ?? -63.4,
      longitude: params?.longitude ?? -57.2,
      vessel_speed_knots: params?.vessel_speed_knots ?? 11.4,
      vessel_ice_class: params?.vessel_ice_class ?? "Polar Class 3 (PC3)",
      wind_speed_knots: params?.wind_speed_knots ?? 24.0,
      air_temp_c: params?.air_temp_c ?? -3.5,
      current_speed_knots: params?.current_speed_knots ?? 0.4,
      waypoints: params?.waypoints,
    };

    const res = await apiFetch<any>("/risk", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res && res.overall !== undefined) {
      let status: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL' = 'MODERATE';
      if (res.status === 'LOW') status = 'LOW';
      else if (res.status === 'LOW-MODERATE' || res.status === 'MODERATE') status = 'MODERATE';
      else if (res.status === 'HIGH') status = 'ELEVATED';
      else if (res.status === 'CRITICAL') status = 'CRITICAL';

      return {
        overallRiskScore: res.overall,
        status,
        seaIceRisk: res.sea_ice ?? 50,
        icebergRisk: res.iceberg ?? 50,
        weatherRisk: res.weather ?? 50,
        oceanCurrentRisk: res.ocean ?? 50,
        visibilityRisk: res.visibility ?? 50,
        aiRecommendation: res.ai_recommendation ?? MOCK_RISK_ASSESSMENT.aiRecommendation,
        recommendedAction: res.recommended_action ?? MOCK_RISK_ASSESSMENT.recommendedAction,
        riskTrend: res.overall > 60 ? "INCREASING" : "STABLE",
        lastEvaluated: new Date().toISOString(),
        riskZones: MOCK_RISK_ASSESSMENT.riskZones,
      };
    }
  } catch (error) {
    console.warn("[ICEGUARD] Live risk evaluation failed, using fallback:", error);
  }

  return { ...MOCK_RISK_ASSESSMENT };
}
