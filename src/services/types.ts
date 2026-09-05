export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface TrajectoryPoint {
  lat: number;
  lng: number;
  speedKnots: number;
  headingDeg: number;
  timestamp?: string;
  uncertaintyRadiusKm: number;
}

export interface Iceberg {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  sizeKm: {
    length: number;
    width: number;
    area: number;
  };
  thicknessM: number;
  estimatedMassGt: number;
  driftSpeedKnots: number;
  driftDirectionDeg: number;
  detectionConfidence: number;
  lastObserved: string;
  sensorSource: string;
  riskTier: RiskSeverity;
  calvingOrigin: string;
  description: string;
  historicalTrail: Array<{ timestamp: string; lat: number; lng: number }>;
  predictions: {
    '24h': TrajectoryPoint;
    '48h': TrajectoryPoint;
    '72h': TrajectoryPoint;
    '7d': TrajectoryPoint;
  };
  surfaceTemperatureC: number;
  meltRateMPerDay: number;
}

export interface SeaIceConcentrationZone {
  id: string;
  name: string;
  concentrationPercent: number;
  thicknessM: number;
  lat: number;
  lng: number;
  radiusKm: number;
  category: 'FAST_ICE' | 'HEAVY_PACK' | 'MEDIUM_PACK' | 'OPEN_DRIFT' | 'MARGINAL_ZONE';
  color: string;
}

export interface SeaIceData {
  overallCoveragePercent: number;
  meanThicknessM: number;
  driftSpeedKnots: number;
  driftDirectionDeg: number;
  growthTrend: 'EXPANDING' | 'RETREATING' | 'STABLE';
  retreatVelocityKmPerDay: number;
  historicalCoverage: Array<{ date: string; coverage: number; thickness: number }>;
  forecastTimeline: Array<{
    hours: number;
    meanConcentration: number;
    edgeDisplacementKm: number;
    confidence: number;
    growthRate: number;
  }>;
  thicknessDistribution: Array<{
    category: string;
    range: string;
    percentage: number;
    color: string;
  }>;
  driftSpeedHistory: Array<{
    time: string;
    velocityKnots: number;
    windCouplingFactor: number;
  }>;
  concentrationZones: SeaIceConcentrationZone[];
}

export interface VesselTelemetry {
  id: string;
  name: string;
  callsign: string;
  flag: string;
  iceClass: string;
  lengthM: number;
  beamM: number;
  draftM: number;
  speedKnots: number;
  headingDeg: number;
  currentLat: number;
  currentLng: number;
  destination: string;
  departurePoint: string;
  eta: string;
  fuelReservePercent: number;
  hullStressIndex: number;
  iceBeltReinforcement: string;
  satelliteUplinkQuality: number;
}

export interface RouteOption {
  id: string;
  name: string;
  tagline: string;
  type: 'safe' | 'fast' | 'balanced';
  isRecommended: boolean;
  distanceNm: number;
  estimatedHours: number;
  riskScore: number; // 0 - 100
  iceExposurePercent: number;
  icebergEncounterProbability: number;
  fuelTons: number;
  safetyBufferNm: number;
  hazardSummary: string;
  color: string;
  waypoints: Array<{ lat: number; lng: number; name?: string; speedLimitKnots?: number }>;
}

export interface RiskZone {
  id: string;
  name: string;
  category: 'HEAVY_PACK_ICE' | 'TABULAR_CLUSTER' | 'KATABATIC_WIND' | 'SUBMERGED_PINNACLE';
  severity: RiskSeverity;
  lat: number;
  lng: number;
  radiusKm: number;
  coordinates?: Array<[number, number]>;
  description: string;
  hazardNotice: string;
}

export interface RiskAssessment {
  overallRiskScore: number;
  status: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  seaIceRisk: number;
  icebergRisk: number;
  weatherRisk: number;
  oceanCurrentRisk: number;
  visibilityRisk: number;
  aiRecommendation: string;
  recommendedAction: string;
  lastEvaluated: string;
  riskTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  riskZones: RiskZone[];
}

export interface SatellitePass {
  id: string;
  name: string;
  satellite: 'Sentinel-1' | 'Sentinel-2' | 'MODIS' | 'VIIRS';
  sensorType: string;
  orbitPass: 'Ascending' | 'Descending';
  acquisitionTime: string;
  coverageSqKm: number;
  resolutionM: number;
  cloudCoveragePercent: number;
  dataQualityPercent: number;
  swathWidthKm: number;
  imageryType: 'Synthetic Aperture Radar (SAR)' | 'True Color RGB' | 'Thermal Infrared' | 'Day/Night Band';
  spectralBands: string;
  beforeAfterComparison?: {
    baselineDate: string;
    currentDate: string;
    iceMovementKm: number;
    fractureDetected: boolean;
  };
}

export interface AIModelStatus {
  id: string;
  name: string;
  category: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  version: string;
  architecture: string;
  lastTrained: string;
  primaryMetric: {
    label: string;
    value: string;
  };
  inferenceLatencyMs: number;
  trainingSamples: string;
  predictionHorizon: string;
  f1Score: number;
  residualErrorKm: number;
  trainingMetrics: Array<{
    epoch: number;
    trainingLoss: number;
    validationAccuracy: number;
  }>;
}

export interface MaritimeAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'INFORMATION';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
  relatedIcebergId?: string;
  coordinates?: { lat: number; lng: number };
  suggestedAction?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  category?: 'ROUTE' | 'ICEBERG' | 'WEATHER' | 'GENERAL';
  actionButton?: {
    label: string;
    actionType: 'NAVIGATE' | 'VIEW_MAP' | 'RECALCULATE' | 'APPLY_ROUTE';
    payload: string;
  };
}

export type SimulationStep = 'T+0' | 'T+24h' | 'T+48h' | 'T+72h' | 'T+7d';
