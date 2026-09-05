import { AIModelStatus } from "./types";

export const MOCK_AI_MODELS: AIModelStatus[] = [
  {
    id: "model-sea-ice-forecast",
    name: "Sea-Ice Spatio-Temporal Forecast Engine",
    category: "Cryospheric Dynamics",
    status: "ONLINE",
    version: "v3.4.1-rc2",
    architecture: "Spatio-Temporal ConvLSTM + Graph Attention Network (GAT)",
    lastTrained: "2026-09-02T18:00:00Z",
    primaryMetric: { label: "Spatial IoU", value: "94.2%" },
    inferenceLatencyMs: 142,
    trainingSamples: "1.8M SAR Radar Slices (2014-2026)",
    predictionHorizon: "72 Hours (3-Hour Increments)",
    f1Score: 0.942,
    residualErrorKm: 2.1,
    trainingMetrics: [
      { epoch: 10, trainingLoss: 0.38, validationAccuracy: 82.4 },
      { epoch: 20, trainingLoss: 0.26, validationAccuracy: 88.1 },
      { epoch: 30, trainingLoss: 0.18, validationAccuracy: 91.6 },
      { epoch: 40, trainingLoss: 0.13, validationAccuracy: 93.4 },
      { epoch: 50, trainingLoss: 0.09, validationAccuracy: 94.2 },
    ],
  },
  {
    id: "model-iceberg-detection",
    name: "Iceberg SAR Target Detection & Segmentation",
    category: "Computer Vision / Radar",
    status: "ONLINE",
    version: "v4.1.0",
    architecture: "YOLOv9-Polar + Speckle Despeckling UNet",
    lastTrained: "2026-09-03T12:30:00Z",
    primaryMetric: { label: "mAP@50", value: "96.8%" },
    inferenceLatencyMs: 85,
    trainingSamples: "420,000 Annotated Tabular & Pinnacle Bergs",
    predictionHorizon: "Real-time Swath Processing",
    f1Score: 0.968,
    residualErrorKm: 0.4,
    trainingMetrics: [
      { epoch: 10, trainingLoss: 0.42, validationAccuracy: 85.0 },
      { epoch: 20, trainingLoss: 0.28, validationAccuracy: 90.5 },
      { epoch: 30, trainingLoss: 0.19, validationAccuracy: 94.0 },
      { epoch: 40, trainingLoss: 0.12, validationAccuracy: 96.1 },
      { epoch: 50, trainingLoss: 0.08, validationAccuracy: 96.8 },
    ],
  },
  {
    id: "model-iceberg-trajectory",
    name: "Hydrodynamic Iceberg Drift & Kinematics",
    category: "Physics-Informed ML",
    status: "ONLINE",
    version: "v2.8.5",
    architecture: "PINN (Physics-Informed Neural Net) + Ekman Current Coupling",
    lastTrained: "2026-09-04T08:15:00Z",
    primaryMetric: { label: "72h Vector Precision", value: "91.4%" },
    inferenceLatencyMs: 110,
    trainingSamples: "68,000 Argo Float + USNIC Drift Track Trajectories",
    predictionHorizon: "7 Days (Probabilistic Cone)",
    f1Score: 0.914,
    residualErrorKm: 3.8,
    trainingMetrics: [
      { epoch: 10, trainingLoss: 0.49, validationAccuracy: 78.9 },
      { epoch: 20, trainingLoss: 0.35, validationAccuracy: 84.6 },
      { epoch: 30, trainingLoss: 0.24, validationAccuracy: 88.7 },
      { epoch: 40, trainingLoss: 0.16, validationAccuracy: 90.5 },
      { epoch: 50, trainingLoss: 0.11, validationAccuracy: 91.4 },
    ],
  },
  {
    id: "model-navigation-risk",
    name: "Multi-Factor Maritime Hazard Classifier",
    category: "Risk Assessment",
    status: "ONLINE",
    version: "v3.0.2",
    architecture: "Bayesian Risk Network + Extreme Gradient Boosting (XGBoost)",
    lastTrained: "2026-09-04T16:45:00Z",
    primaryMetric: { label: "ROC-AUC", value: "0.954" },
    inferenceLatencyMs: 64,
    trainingSamples: "250,000 Antarctic Voyage Log Incidents & Reports",
    predictionHorizon: "Continuous Stream",
    f1Score: 0.937,
    residualErrorKm: 1.2,
    trainingMetrics: [
      { epoch: 10, trainingLoss: 0.35, validationAccuracy: 86.2 },
      { epoch: 20, trainingLoss: 0.22, validationAccuracy: 90.1 },
      { epoch: 30, trainingLoss: 0.15, validationAccuracy: 92.4 },
      { epoch: 40, trainingLoss: 0.11, validationAccuracy: 93.1 },
      { epoch: 50, trainingLoss: 0.07, validationAccuracy: 93.7 },
    ],
  },
  {
    id: "model-route-optimizer",
    name: "Pareto-Optimal Ice Navigation Path Engine",
    category: "Trajectory Optimization",
    status: "ONLINE",
    version: "v5.2.0",
    architecture: "Constrained 4D A* + Multi-Objective Genetic Algorithm (NSGA-II)",
    lastTrained: "2026-09-01T20:00:00Z",
    primaryMetric: { label: "Pareto Optimality", value: "98.2%" },
    inferenceLatencyMs: 210,
    trainingSamples: "Polar Code IMO Compliant Passage DB",
    predictionHorizon: "Passage Duration (up to 14 Days)",
    f1Score: 0.982,
    residualErrorKm: 0.0,
    trainingMetrics: [
      { epoch: 10, trainingLoss: 0.31, validationAccuracy: 89.0 },
      { epoch: 20, trainingLoss: 0.19, validationAccuracy: 94.2 },
      { epoch: 30, trainingLoss: 0.12, validationAccuracy: 96.8 },
      { epoch: 40, trainingLoss: 0.08, validationAccuracy: 97.9 },
      { epoch: 50, trainingLoss: 0.04, validationAccuracy: 98.2 },
    ],
  },
];

import { apiFetch } from "./apiClient";

export interface VerifiedModelMetrics {
  sea_ice_model?: {
    model_name: string;
    model_version: string;
    training_samples: number;
    test_samples: number;
    mean_r2: number;
    mean_mae_percent: number;
    metrics: {
      r2_24h: number;
      mae_24h: number;
      rmse_24h: number;
      r2_48h: number;
      mae_48h: number;
      rmse_48h: number;
      r2_72h: number;
      mae_72h: number;
      rmse_72h: number;
    };
    data_provenance: string;
  };
  iceberg_trajectory_model?: {
    model_name: string;
    model_version: string;
    training_samples: number;
    test_samples: number;
    mean_positional_error_km: number;
    std_err_lat_deg: number;
    std_err_lon_deg: number;
    uncertainty_base_24h_km: number;
    uncertainty_base_48h_km: number;
    uncertainty_base_72h_km: number;
    uncertainty_base_7d_km: number;
    data_provenance: string;
  };
}

export async function getModelEvaluationMetrics(): Promise<VerifiedModelMetrics | null> {
  try {
    return await apiFetch<VerifiedModelMetrics>("/models/metrics");
  } catch (error) {
    console.warn("[ICEGUARD] Live metrics fetch failed, using local model info:", error);
    return null;
  }
}

export async function getAIModelStatuses(): Promise<AIModelStatus[]> {
  try {
    const statuses = await apiFetch<AIModelStatus[]>("/models/status");
    const verifiedMetrics = await getModelEvaluationMetrics();

    if (statuses && Array.isArray(statuses) && statuses.length > 0) {
      // Enrich with verified real metrics if present
      if (verifiedMetrics) {
        return statuses.map((m) => {
          if (m.id.includes("sea-ice") && verifiedMetrics.sea_ice_model) {
            const si = verifiedMetrics.sea_ice_model;
            return {
              ...m,
              version: si.model_version,
              primaryMetric: {
                label: "Mean R² (24-72h)",
                value: `${(si.mean_r2 * 100).toFixed(1)}%`,
              },
              f1Score: si.mean_r2,
              trainingSamples: `${si.training_samples} Ingested Samples`,
            };
          }
          if (m.id.includes("trajectory") && verifiedMetrics.iceberg_trajectory_model) {
            const traj = verifiedMetrics.iceberg_trajectory_model;
            return {
              ...m,
              version: traj.model_version,
              residualErrorKm: traj.mean_positional_error_km,
              primaryMetric: {
                label: "Mean Positional Error",
                value: `${traj.mean_positional_error_km} km`,
              },
              trainingSamples: `${traj.training_samples} Trajectory Segments`,
            };
          }
          return m;
        });
      }
      return statuses;
    }
  } catch (error) {
    console.warn("[ICEGUARD] Live model statuses fetch failed, using local fallback:", error);
  }

  return [...MOCK_AI_MODELS];
}
