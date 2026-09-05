import { Iceberg, SimulationStep } from "./types";

export const MOCK_ICEBERGS: Iceberg[] = [
  {
    id: "A23A",
    name: "Iceberg A-23A",
    code: "USNIC-2024-A23A",
    latitude: -60.85,
    longitude: -48.20,
    sizeKm: {
      length: 38,
      width: 12,
      area: 4120,
    },
    thicknessM: 320,
    estimatedMassGt: 1100,
    driftSpeedKnots: 0.34,
    driftDirectionDeg: 127,
    detectionConfidence: 94,
    lastObserved: "2026-09-05T04:30:00Z",
    sensorSource: "Sentinel-1 SAR C-Band",
    riskTier: "CRITICAL",
    calvingOrigin: "Filchner-Ronne Ice Shelf (Grounding released in Weddell Gyre)",
    description: "World's largest active tabular iceberg. Exiting Weddell Sea toward Scotia Arc. Drifting in the Antarctic Circumpolar Current with elevated risk of maritime collision in shipping lanes.",
    surfaceTemperatureC: -1.8,
    meltRateMPerDay: 0.04,
    historicalTrail: [
      { timestamp: "T-72h", lat: -61.22, lng: -49.10 },
      { timestamp: "T-48h", lat: -61.08, lng: -48.75 },
      { timestamp: "T-24h", lat: -60.95, lng: -48.45 },
      { timestamp: "T-0h", lat: -60.85, lng: -48.20 },
    ],
    predictions: {
      "24h": { lat: -60.72, lng: -47.90, speedKnots: 0.36, headingDeg: 129, uncertaintyRadiusKm: 6.2 },
      "48h": { lat: -60.58, lng: -47.55, speedKnots: 0.38, headingDeg: 132, uncertaintyRadiusKm: 12.8 },
      "72h": { lat: -60.42, lng: -47.12, speedKnots: 0.41, headingDeg: 135, uncertaintyRadiusKm: 21.5 },
      "7d": { lat: -59.85, lng: -45.70, speedKnots: 0.46, headingDeg: 140, uncertaintyRadiusKm: 46.0 },
    },
  },
  {
    id: "A76A",
    name: "Iceberg A-76A",
    code: "USNIC-2023-A76A",
    latitude: -58.92,
    longitude: -42.15,
    sizeKm: {
      length: 29,
      width: 9,
      area: 1980,
    },
    thicknessM: 265,
    estimatedMassGt: 520,
    driftSpeedKnots: 0.52,
    driftDirectionDeg: 88,
    detectionConfidence: 96,
    lastObserved: "2026-09-05T03:15:00Z",
    sensorSource: "Sentinel-1 SAR C-Band",
    riskTier: "HIGH",
    calvingOrigin: "Ronne Ice Shelf",
    description: "Major tabular berg fragment transiting Drake Passage extension toward South Georgia. Intense wave erosion and sub-surface calving spurs observed.",
    surfaceTemperatureC: -0.9,
    meltRateMPerDay: 0.08,
    historicalTrail: [
      { timestamp: "T-72h", lat: -59.35, lng: -43.80 },
      { timestamp: "T-48h", lat: -59.20, lng: -43.20 },
      { timestamp: "T-24h", lat: -59.05, lng: -42.65 },
      { timestamp: "T-0h", lat: -58.92, lng: -42.15 },
    ],
    predictions: {
      "24h": { lat: -58.80, lng: -41.50, speedKnots: 0.54, headingDeg: 90, uncertaintyRadiusKm: 7.5 },
      "48h": { lat: -58.65, lng: -40.80, speedKnots: 0.58, headingDeg: 92, uncertaintyRadiusKm: 15.0 },
      "72h": { lat: -58.48, lng: -40.05, speedKnots: 0.61, headingDeg: 95, uncertaintyRadiusKm: 24.2 },
      "7d": { lat: -57.80, lng: -37.90, speedKnots: 0.68, headingDeg: 98, uncertaintyRadiusKm: 52.0 },
    },
  },
  {
    id: "B15A-FRAG",
    name: "Iceberg B-15A Remnant",
    code: "USNIC-2000-B15A-R",
    latitude: -67.45,
    longitude: 172.80,
    sizeKm: {
      length: 16,
      width: 7,
      area: 840,
    },
    thicknessM: 210,
    estimatedMassGt: 180,
    driftSpeedKnots: 0.28,
    driftDirectionDeg: 245,
    detectionConfidence: 91,
    lastObserved: "2026-09-05T01:45:00Z",
    sensorSource: "MODIS Thermal IR",
    riskTier: "MODERATE",
    calvingOrigin: "Ross Ice Shelf",
    description: "Durable remnant berg in Ross Sea eastern sector. Anchored intermittently in coastal banks before prevailing katabatic winds push offshore.",
    surfaceTemperatureC: -3.4,
    meltRateMPerDay: 0.02,
    historicalTrail: [
      { timestamp: "T-72h", lat: -67.38, lng: 173.30 },
      { timestamp: "T-48h", lat: -67.40, lng: 173.12 },
      { timestamp: "T-24h", lat: -67.42, lng: 172.95 },
      { timestamp: "T-0h", lat: -67.45, lng: 172.80 },
    ],
    predictions: {
      "24h": { lat: -67.48, lng: 172.60, speedKnots: 0.30, headingDeg: 248, uncertaintyRadiusKm: 5.0 },
      "48h": { lat: -67.52, lng: 172.35, speedKnots: 0.32, headingDeg: 250, uncertaintyRadiusKm: 10.4 },
      "72h": { lat: -67.57, lng: 172.05, speedKnots: 0.35, headingDeg: 252, uncertaintyRadiusKm: 18.0 },
      "7d": { lat: -67.75, lng: 170.80, speedKnots: 0.39, headingDeg: 255, uncertaintyRadiusKm: 38.0 },
    },
  },
  {
    id: "D28",
    name: "Iceberg D-28",
    code: "USNIC-2019-D28",
    latitude: -64.12,
    longitude: 65.40,
    sizeKm: {
      length: 22,
      width: 11,
      area: 1630,
    },
    thicknessM: 240,
    estimatedMassGt: 315,
    driftSpeedKnots: 0.42,
    driftDirectionDeg: 305,
    detectionConfidence: 93,
    lastObserved: "2026-09-05T02:00:00Z",
    sensorSource: "VIIRS Day/Night Band",
    riskTier: "MODERATE",
    calvingOrigin: "Amery Ice Shelf ('Loose Tooth' zone)",
    description: "East Antarctic tabular berg drifting westward along the Antarctic Coastal Current. High radar reflectivity.",
    surfaceTemperatureC: -2.8,
    meltRateMPerDay: 0.03,
    historicalTrail: [
      { timestamp: "T-72h", lat: -64.30, lng: 66.20 },
      { timestamp: "T-48h", lat: -64.24, lng: 65.92 },
      { timestamp: "T-24h", lat: -64.18, lng: 65.65 },
      { timestamp: "T-0h", lat: -64.12, lng: 65.40 },
    ],
    predictions: {
      "24h": { lat: -64.05, lng: 65.10, speedKnots: 0.44, headingDeg: 308, uncertaintyRadiusKm: 5.8 },
      "48h": { lat: -63.98, lng: 64.75, speedKnots: 0.45, headingDeg: 310, uncertaintyRadiusKm: 11.6 },
      "72h": { lat: -63.90, lng: 64.35, speedKnots: 0.47, headingDeg: 312, uncertaintyRadiusKm: 19.2 },
      "7d": { lat: -63.50, lng: 62.50, speedKnots: 0.50, headingDeg: 315, uncertaintyRadiusKm: 42.0 },
    },
  },
  {
    id: "B31",
    name: "Iceberg B-31",
    code: "USNIC-2013-B31",
    latitude: -70.40,
    longitude: -105.80,
    sizeKm: {
      length: 18,
      width: 8,
      area: 660,
    },
    thicknessM: 400,
    estimatedMassGt: 230,
    driftSpeedKnots: 0.22,
    driftDirectionDeg: 15,
    detectionConfidence: 89,
    lastObserved: "2026-09-04T22:30:00Z",
    sensorSource: "Sentinel-1 SAR C-Band",
    riskTier: "LOW",
    calvingOrigin: "Pine Island Glacier (Amundsen Sea)",
    description: "Heavily fractured tabular berg within coastal sea-ice fastness. Slow rotational velocity.",
    surfaceTemperatureC: -4.1,
    meltRateMPerDay: 0.015,
    historicalTrail: [
      { timestamp: "T-72h", lat: -70.52, lng: -105.90 },
      { timestamp: "T-48h", lat: -70.48, lng: -105.86 },
      { timestamp: "T-24h", lat: -70.44, lng: -105.83 },
      { timestamp: "T-0h", lat: -70.40, lng: -105.80 },
    ],
    predictions: {
      "24h": { lat: -70.36, lng: -105.77, speedKnots: 0.23, headingDeg: 18, uncertaintyRadiusKm: 4.2 },
      "48h": { lat: -70.31, lng: -105.74, speedKnots: 0.24, headingDeg: 20, uncertaintyRadiusKm: 8.8 },
      "72h": { lat: -70.25, lng: -105.70, speedKnots: 0.26, headingDeg: 22, uncertaintyRadiusKm: 14.5 },
      "7d": { lat: -69.95, lng: -105.45, speedKnots: 0.30, headingDeg: 25, uncertaintyRadiusKm: 32.0 },
    },
  },
  {
    id: "A81",
    name: "Iceberg A-81",
    code: "USNIC-2023-A81",
    latitude: -74.85,
    longitude: -32.40,
    sizeKm: {
      length: 31,
      width: 14,
      area: 1550,
    },
    thicknessM: 280,
    estimatedMassGt: 430,
    driftSpeedKnots: 0.31,
    driftDirectionDeg: 260,
    detectionConfidence: 95,
    lastObserved: "2026-09-05T05:00:00Z",
    sensorSource: "Sentinel-1 SAR C-Band",
    riskTier: "CRITICAL",
    calvingOrigin: "Brunt Ice Shelf (Chasm-1 Rift)",
    description: "Deep-keeled tabular berg rotating southwest within Weddell Sea coastal current. Close proximity to Halley VI research station resupply corridor.",
    surfaceTemperatureC: -5.2,
    meltRateMPerDay: 0.01,
    historicalTrail: [
      { timestamp: "T-72h", lat: -74.75, lng: -31.50 },
      { timestamp: "T-48h", lat: -74.78, lng: -31.80 },
      { timestamp: "T-24h", lat: -74.81, lng: -32.10 },
      { timestamp: "T-0h", lat: -74.85, lng: -32.40 },
    ],
    predictions: {
      "24h": { lat: -74.88, lng: -32.75, speedKnots: 0.32, headingDeg: 262, uncertaintyRadiusKm: 5.5 },
      "48h": { lat: -74.92, lng: -33.15, speedKnots: 0.34, headingDeg: 265, uncertaintyRadiusKm: 11.2 },
      "72h": { lat: -74.96, lng: -33.60, speedKnots: 0.36, headingDeg: 268, uncertaintyRadiusKm: 18.0 },
      "7d": { lat: -75.15, lng: -35.80, speedKnots: 0.40, headingDeg: 272, uncertaintyRadiusKm: 40.0 },
    },
  },
];

import { apiFetch } from "./apiClient";

export async function getIcebergs(): Promise<Iceberg[]> {
  try {
    const data = await apiFetch<Iceberg[]>("/icebergs");
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn("[ICEGUARD] Falling back to local iceberg repository:", error);
  }
  return [...MOCK_ICEBERGS];
}

export async function getIcebergById(id: string): Promise<Iceberg | null> {
  try {
    const berg = await apiFetch<Iceberg>(`/icebergs/${id}`);
    if (berg && berg.id) {
      return berg;
    }
  } catch (error) {
    console.warn(`[ICEGUARD] Live fetch failed for iceberg ${id}, searching local cache:`, error);
  }

  const localBerg = MOCK_ICEBERGS.find(
    (b) => b.id.toLowerCase() === id.toLowerCase() || b.code.toLowerCase().includes(id.toLowerCase())
  );
  return localBerg ? { ...localBerg } : null;
}

export async function getIcebergTrajectory(id: string): Promise<any> {
  try {
    const traj = await apiFetch<any>(`/icebergs/${id}/trajectory`);
    if (traj) return traj;
  } catch (error) {
    console.warn(`[ICEGUARD] Live trajectory fetch failed for iceberg ${id}:`, error);
  }
  const fallback = await getIcebergById(id);
  return fallback ? fallback.predictions : null;
}

export async function getIcebergsByTimeOffset(step: SimulationStep): Promise<Iceberg[]> {
  const bergs = await getIcebergs();
  if (step === "T+0") return bergs;

  const key = step === "T+24h" ? "24h" : step === "T+48h" ? "48h" : step === "T+72h" ? "72h" : "7d";

  return bergs.map((berg) => {
    const pred = berg.predictions ? berg.predictions[key] : null;
    if (!pred) return berg;
    return {
      ...berg,
      latitude: pred.lat,
      longitude: pred.lng,
      driftSpeedKnots: pred.speedKnots,
      driftDirectionDeg: pred.headingDeg,
    };
  });
}
