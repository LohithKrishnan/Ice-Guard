"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  TriangleAlert,
  Compass,
  ArrowLeft,
  Calendar,
  Layers,
  Wind,
  Waves,
  Maximize2,
  Sliders,
  Sparkles,
  ShieldAlert,
  Info,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import KpiCard from "@/components/common/KpiCard";
import { getIcebergById, MOCK_ICEBERGS } from "@/services/icebergService";
import { Iceberg } from "@/services/types";
import { formatCoordinates, formatLat, formatLng, getRiskColor } from "@/lib/utils";
import { useSimulation } from "@/context/SimulationContext";
import { useNavigation } from "@/context/NavigationContext";

const AntarcticMap = dynamic(() => import("@/components/map/AntarcticMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-polar-950 flex items-center justify-center font-mono text-cyan-400 text-xs">
      SYNCHRONIZING HYDRODYNAMIC TRAJECTORY CONES...
    </div>
  ),
});

export default function IcebergDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "A23A";

  const [iceberg, setIceberg] = useState<Iceberg | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<"24h" | "48h" | "72h" | "7d">("72h");
  const { setSelectedIcebergId } = useNavigation();

  useEffect(() => {
    async function load() {
      const data = await getIcebergById(id);
      if (data) {
        setIceberg(data);
        setSelectedIcebergId(data.id);
      } else {
        // Fallback to first iceberg if not found
        setIceberg(MOCK_ICEBERGS[0]);
        setSelectedIcebergId(MOCK_ICEBERGS[0].id);
      }
    }
    load();
  }, [id, setSelectedIcebergId]);

  if (!iceberg) {
    return (
      <div className="p-8 font-mono text-cyan-400 flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>RETRIEVING TARGET KINEMATICS...</span>
      </div>
    );
  }

  const pred = iceberg.predictions[selectedHorizon];
  const riskColors = getRiskColor(iceberg.riskTier);

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-polar-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/icebergs"
            className="p-1.5 rounded-md bg-polar-900 border border-polar-750 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white">
                {iceberg.name}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${riskColors.badge}`}>
                {iceberg.riskTier} HAZARD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
              <span>USNIC Designation: {iceberg.code} | Sensor: {iceberg.sensorSource}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold">
                FASTAPI LIVE (/api/icebergs/{iceberg.id})
              </span>
            </p>
          </div>
        </div>

        {/* Operational Action Buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => router.push("/route-planner")}
            className="py-1.5 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-cyan-glow"
          >
            PREDICT TRAJECTORY IN PLANNER
          </button>
          <button
            onClick={() => router.push("/risk")}
            className="py-1.5 px-3 rounded bg-polar-900 hover:bg-polar-800 border border-cyan-500/40 text-cyan-300 transition-colors"
          >
            ADD TO RISK ANALYSIS
          </button>
        </div>
      </div>

      {/* 4 Quantitative Spec Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="DIMENSIONS & SIZE"
          value={`${iceberg.sizeKm.length} × ${iceberg.sizeKm.width} km`}
          subValue={`(${iceberg.sizeKm.area.toLocaleString()} km²)`}
          change={`Mass: ~${iceberg.estimatedMassGt} Gt`}
          trend="neutral"
          icon={Layers}
          colorScheme="cyan"
          footerNotice="Keel Draft: 240-320m"
        />
        <KpiCard
          label="OBSERVED DRIFT"
          value={`${iceberg.driftSpeedKnots} kt`}
          subValue={`@ ${iceberg.driftDirectionDeg}°`}
          change="ACC Gyre Entrained"
          trend="up"
          icon={Wind}
          colorScheme="blue"
          footerNotice="Drift Velocity"
        />
        <KpiCard
          label="DETECTION CONFIDENCE"
          value={`${iceberg.detectionConfidence}%`}
          change="SAR C-Band Confirmed"
          trend="up"
          icon={Sparkles}
          colorScheme="emerald"
          footerNotice={iceberg.lastObserved.replace("T", " ").slice(0, 16) + " UTC"}
        />
        <KpiCard
          label="SURFACE MELT RATE"
          value={`${iceberg.meltRateMPerDay} m`}
          subValue="/ day"
          change={`SST: ${iceberg.surfaceTemperatureC}°C`}
          trend="up"
          trendSeverity="warning"
          icon={Waves}
          colorScheme="amber"
          footerNotice="Wave Erosion Zone"
        />
      </div>

      {/* Main Grid: Interactive Map with Trajectory Cone + Trajectory Forecaster */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Map Centerpiece (Spans 7 cols) */}
        <div className="xl:col-span-7 rounded-lg border border-polar-750 overflow-hidden shadow-2xl relative min-h-[520px] flex flex-col bg-polar-950">
          <AntarcticMap />
        </div>

        {/* Deep Kinematics & Trajectory Horizons (Spans 5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <GlassPanel
            title="TRAJECTORY FORECAST & UNCERTAINTY CONE"
            subtitle="Physics-Informed Neural Network (PINN) Ekman Coupling"
            icon={Compass}
          >
            {/* Horizon Selector */}
            <div className="grid grid-cols-4 gap-1.5 bg-polar-950 p-1 rounded-lg border border-polar-800 text-xs font-mono mb-3">
              {(["24h", "48h", "72h", "7d"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={`py-1.5 rounded font-semibold transition-all ${
                    selectedHorizon === h
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  +{h}
                </button>
              ))}
            </div>

            {/* Selected Horizon Metrics Callout */}
            <div className="p-3 rounded-lg bg-polar-950 border border-cyan-500/30 font-mono space-y-2">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-polar-800">
                <span className="text-cyan-300 font-bold">
                  HORIZON +{selectedHorizon} FORECAST SUMMARY
                </span>
                <span className="text-emerald-400 font-bold">
                  CONFIDENCE: {selectedHorizon === "24h" ? "96%" : selectedHorizon === "48h" ? "93%" : selectedHorizon === "72h" ? "91%" : "84%"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">PROJECTED POSITION</span>
                  <span className="text-white font-bold">
                    {formatCoordinates(pred.lat, pred.lng)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">UNCERTAINTY RADIUS</span>
                  <span className="text-amber-400 font-bold">
                    ±{pred.uncertaintyRadiusKm} km (95% CI)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">PREDICTED SPEED</span>
                  <span className="text-cyan-300 font-bold">
                    {pred.speedKnots} knots
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block">PREDICTED DIRECTION</span>
                  <span className="text-cyan-300 font-bold">
                    {pred.headingDeg}° True
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Horizon Timeline Stepper */}
            <div className="mt-4 space-y-2 font-mono text-xs">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                WAYPOINT KINEMATICS TIMELINE
              </div>

              {(["24h", "48h", "72h", "7d"] as const).map((step) => {
                const stepPred = iceberg.predictions[step];
                const isActive = selectedHorizon === step;

                return (
                  <div
                    key={step}
                    onClick={() => setSelectedHorizon(step)}
                    className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "bg-polar-850 border-cyan-400 text-white"
                        : "bg-polar-950/60 border-polar-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-cyan-400" : "bg-slate-600"}`} />
                      <span className="font-bold">+{step}</span>
                      <span className="text-[11px] text-slate-300">
                        {formatLat(stepPred.lat)} {formatLng(stepPred.lng)}
                      </span>
                    </div>

                    <div className="text-[11px] text-right">
                      <span className="text-cyan-300">{stepPred.speedKnots} kt</span>
                      <span className="text-slate-500 ml-2">±{stepPred.uncertaintyRadiusKm}km</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tactical Origin & Calving Narrative */}
            <div className="mt-4 p-3 rounded-lg bg-polar-950/80 border border-polar-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white block mb-1 font-mono">
                CALVING MORPHOLOGY & MARITIME HAZARDS:
              </span>
              <p className="text-[11px] font-mono text-slate-400">
                {iceberg.description} Grounding telemetry suggests the keel is free of seafloor pinnacles. Transiting in the core of the Antarctic Circumpolar Current. Sub-surface rams extend up to 800m seaward. Maintain minimum 5 nautical miles stand-off distance.
              </p>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
