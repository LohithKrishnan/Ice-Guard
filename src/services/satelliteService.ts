import { SatellitePass } from "./types";

export const MOCK_SATELLITE_PASSES: SatellitePass[] = [
  {
    id: "SAT-S1A-20260905-0430",
    name: "Sentinel-1A SAR Polar Orbit",
    satellite: "Sentinel-1",
    sensorType: "C-Band Synthetic Aperture Radar (SAR)",
    orbitPass: "Ascending",
    acquisitionTime: "2026-09-05T04:30:12Z",
    coverageSqKm: 185000,
    resolutionM: 10,
    cloudCoveragePercent: 0, // SAR penetrates clouds & darkness
    dataQualityPercent: 99.4,
    swathWidthKm: 410,
    imageryType: "Synthetic Aperture Radar (SAR)",
    spectralBands: "VV / VH Polarimetric Dual-Channel",
    beforeAfterComparison: {
      baselineDate: "2026-08-28T04:28:00Z",
      currentDate: "2026-09-05T04:30:12Z",
      iceMovementKm: 18.6,
      fractureDetected: true,
    },
  },
  {
    id: "SAT-S2B-20260905-0215",
    name: "Sentinel-2B MultiSpectral MSI",
    satellite: "Sentinel-2",
    sensorType: "MultiSpectral Instrument (VNIR/SWIR)",
    orbitPass: "Descending",
    acquisitionTime: "2026-09-05T02:15:44Z",
    coverageSqKm: 84000,
    resolutionM: 10,
    cloudCoveragePercent: 14.2,
    dataQualityPercent: 93.8,
    swathWidthKm: 290,
    imageryType: "True Color RGB",
    spectralBands: "B2 (Blue), B3 (Green), B4 (Red), B8 (NIR)",
  },
  {
    id: "SAT-MODIS-20260904-2210",
    name: "MODIS Aqua Cryospheric Radiometer",
    satellite: "MODIS",
    sensorType: "Moderate Resolution Imaging Spectroradiometer",
    orbitPass: "Ascending",
    acquisitionTime: "2026-09-04T22:10:05Z",
    coverageSqKm: 920000,
    resolutionM: 250,
    cloudCoveragePercent: 28.5,
    dataQualityPercent: 88.2,
    swathWidthKm: 2330,
    imageryType: "Thermal Infrared",
    spectralBands: "B31 (11µm), B32 (12µm) Ice Surface Temperature",
  },
  {
    id: "SAT-VIIRS-20260904-1845",
    name: "VIIRS Suomi NPP Day/Night Band",
    satellite: "VIIRS",
    sensorType: "Visible Infrared Imaging Radiometer Suite",
    orbitPass: "Descending",
    acquisitionTime: "2026-09-04T18:45:30Z",
    coverageSqKm: 760000,
    resolutionM: 375,
    cloudCoveragePercent: 22.0,
    dataQualityPercent: 91.5,
    swathWidthKm: 3000,
    imageryType: "Day/Night Band",
    spectralBands: "DNB (500-900nm), I-Bands (Imagery Resolution)",
  },
];

import { apiFetch } from "./apiClient";

export async function getSatellitePasses(): Promise<SatellitePass[]> {
  try {
    const passes = await apiFetch<SatellitePass[]>("/satellite");
    if (passes && Array.isArray(passes) && passes.length > 0) {
      return passes;
    }
  } catch (error) {
    console.warn("[ICEGUARD] Live satellite fetch failed, using local catalog:", error);
  }

  return [...MOCK_SATELLITE_PASSES];
}
