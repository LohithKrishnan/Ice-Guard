import { SeaIceData } from "./types";

export const MOCK_SEA_ICE_DATA: SeaIceData = {
  overallCoveragePercent: 78.4,
  meanThicknessM: 1.82,
  driftSpeedKnots: 0.65,
  driftDirectionDeg: 284,
  growthTrend: "RETREATING",
  retreatVelocityKmPerDay: 18.4,
  historicalCoverage: [
    { date: "Aug 01", coverage: 84.2, thickness: 1.95 },
    { date: "Aug 08", coverage: 83.1, thickness: 1.93 },
    { date: "Aug 15", coverage: 81.9, thickness: 1.90 },
    { date: "Aug 22", coverage: 80.5, thickness: 1.87 },
    { date: "Aug 29", coverage: 79.2, thickness: 1.84 },
    { date: "Sep 05", coverage: 78.4, thickness: 1.82 },
  ],
  forecastTimeline: [
    { hours: 24, meanConcentration: 77.8, edgeDisplacementKm: -4.2, confidence: 94, growthRate: -0.6 },
    { hours: 48, meanConcentration: 77.1, edgeDisplacementKm: -9.8, confidence: 91, growthRate: -0.7 },
    { hours: 72, meanConcentration: 76.3, edgeDisplacementKm: -16.5, confidence: 87, growthRate: -0.8 },
  ],
  thicknessDistribution: [
    { category: "Nilas & Young Ice (<0.3m)", range: "0.1 - 0.3m", percentage: 12, color: "#38BDF8" },
    { category: "First-Year Thin (0.3 - 0.7m)", range: "0.3 - 0.7m", percentage: 26, color: "#0284C7" },
    { category: "First-Year Medium (0.7 - 1.2m)", range: "0.7 - 1.2m", percentage: 34, color: "#0369A1" },
    { category: "First-Year Thick (1.2 - 2.0m)", range: "1.2 - 2.0m", percentage: 18, color: "#075985" },
    { category: "Multi-Year / Ridged (>2.0m)", range: ">2.0m", percentage: 10, color: "#0C4A6E" },
  ],
  driftSpeedHistory: [
    { time: "00:00", velocityKnots: 0.58, windCouplingFactor: 0.021 },
    { time: "04:00", velocityKnots: 0.62, windCouplingFactor: 0.022 },
    { time: "08:00", velocityKnots: 0.71, windCouplingFactor: 0.024 },
    { time: "12:00", velocityKnots: 0.68, windCouplingFactor: 0.023 },
    { time: "16:00", velocityKnots: 0.64, windCouplingFactor: 0.022 },
    { time: "20:00", velocityKnots: 0.65, windCouplingFactor: 0.022 },
  ],
  concentrationZones: [
    {
      id: "zone-weddell-pack",
      name: "Weddell Sea Central Pack Ice",
      concentrationPercent: 92,
      thicknessM: 2.3,
      lat: -71.5,
      lng: -42.0,
      radiusKm: 380,
      category: "HEAVY_PACK",
      color: "#0369A1",
    },
    {
      id: "zone-ross-drift",
      name: "Ross Sea Transit Corridor",
      concentrationPercent: 68,
      thicknessM: 1.4,
      lat: -72.0,
      lng: 175.0,
      radiusKm: 420,
      category: "MEDIUM_PACK",
      color: "#0284C7",
    },
    {
      id: "zone-scotia-marginal",
      name: "Scotia Sea Marginal Ice Zone",
      concentrationPercent: 38,
      thicknessM: 0.7,
      lat: -59.5,
      lng: -46.0,
      radiusKm: 260,
      category: "MARGINAL_ZONE",
      color: "#38BDF8",
    },
    {
      id: "zone-bellingshausen-fast",
      name: "Bellingshausen Coast Fast Ice",
      concentrationPercent: 96,
      thicknessM: 2.8,
      lat: -70.0,
      lng: -82.0,
      radiusKm: 310,
      category: "FAST_ICE",
      color: "#0C4A6E",
    },
    {
      id: "zone-davis-open",
      name: "Davis Sea Open Drift Sector",
      concentrationPercent: 52,
      thicknessM: 1.1,
      lat: -65.5,
      lng: 88.0,
      radiusKm: 340,
      category: "OPEN_DRIFT",
      color: "#7DD3FC",
    },
  ],
};

import { apiFetch } from "./apiClient";

export async function getSeaIceData(): Promise<SeaIceData> {
  try {
    const liveData = await apiFetch<any>("/sea-ice/current");
    if (liveData && liveData.concentrationZones) {
      // Fetch live forecast timeline as well
      let liveForecastTimeline = MOCK_SEA_ICE_DATA.forecastTimeline;
      try {
        const forecastData = await apiFetch<any>("/sea-ice/forecast");
        if (forecastData && forecastData.forecastTimeline) {
          liveForecastTimeline = forecastData.forecastTimeline.map((f: any) => ({
            hours: f.hours,
            meanConcentration: f.meanConcentration,
            edgeDisplacementKm: f.edgeDisplacementKm,
            confidence: f.confidence,
            growthRate: -0.6,
          }));
        }
      } catch {
        // use fallback timeline
      }

      return {
        overallCoveragePercent: liveData.overallCoveragePercent ?? MOCK_SEA_ICE_DATA.overallCoveragePercent,
        meanThicknessM: liveData.meanThicknessM ?? MOCK_SEA_ICE_DATA.meanThicknessM,
        driftSpeedKnots: liveData.driftSpeedKnots ?? MOCK_SEA_ICE_DATA.driftSpeedKnots,
        driftDirectionDeg: liveData.driftDirectionDeg ?? MOCK_SEA_ICE_DATA.driftDirectionDeg,
        growthTrend: liveData.growthTrend ?? MOCK_SEA_ICE_DATA.growthTrend,
        retreatVelocityKmPerDay: liveData.retreatVelocityKmPerDay ?? MOCK_SEA_ICE_DATA.retreatVelocityKmPerDay,
        historicalCoverage: MOCK_SEA_ICE_DATA.historicalCoverage,
        forecastTimeline: liveForecastTimeline,
        thicknessDistribution: MOCK_SEA_ICE_DATA.thicknessDistribution,
        driftSpeedHistory: MOCK_SEA_ICE_DATA.driftSpeedHistory,
        concentrationZones: liveData.concentrationZones.map((z: any) => ({
          ...z,
          color:
            z.category === "HEAVY_PACK"
              ? "#0369A1"
              : z.category === "MEDIUM_PACK"
              ? "#0284C7"
              : z.category === "OPEN_DRIFT"
              ? "#7DD3FC"
              : z.category === "FAST_ICE"
              ? "#0C4A6E"
              : "#38BDF8",
        })),
      };
    }
  } catch (error) {
    console.warn("[ICEGUARD] Live fetch failed for sea-ice data, using local store:", error);
  }

  return { ...MOCK_SEA_ICE_DATA };
}

export async function getSeaIceForecast(lat = -62.5, lon = -51.8, currentConc = 74.0): Promise<any> {
  try {
    return await apiFetch<any>(`/sea-ice/forecast?lat=${lat}&lon=${lon}&current_conc=${currentConc}`);
  } catch (error) {
    console.warn("[ICEGUARD] Live forecast fetch failed:", error);
    return null;
  }
}
