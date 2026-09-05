"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Compass,
  AlertTriangle,
  TriangleAlert,
  Wind,
  Waves,
  Eye,
  Snowflake,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import RiskGauge from "@/components/common/RiskGauge";
import { getRiskAssessment } from "@/services/riskService";
import { RiskAssessment } from "@/services/types";
import { useSimulation } from "@/context/SimulationContext";
import { formatCoordinates } from "@/lib/utils";

export default function NavigationRiskPage() {
  const router = useRouter();
  const { snapshot, setActiveRouteId } = useSimulation();
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Custom evaluation parameters state
  const [lat, setLat] = useState<number>(-63.4);
  const [lng, setLng] = useState<number>(-57.2);
  const [iceClass, setIceClass] = useState<string>("Polar Class 3 (PC3)");
  const [speed, setSpeed] = useState<number>(11.4);
  const [windSpeed, setWindSpeed] = useState<number>(24.0);
  const [airTemp, setAirTemp] = useState<number>(-3.5);

  const fetchRisk = async (customParams?: any) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await getRiskAssessment(customParams || {
        latitude: lat,
        longitude: lng,
        vessel_ice_class: iceClass,
        vessel_speed_knots: speed,
        wind_speed_knots: windSpeed,
        air_temp_c: airTemp,
      });
      setAssessment(res);
      setIsLiveApi(true);
    } catch (err: any) {
      setApiError(err?.message || "Failed to evaluate live risk");
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk({ latitude: -63.4, longitude: -57.2, vessel_ice_class: "Polar Class 3 (PC3)" });
  }, []);

  const riskData = assessment || snapshot.riskAssessment;

  const handleApplyRecommended = () => {
    setActiveRouteId("route-balanced");
    setAppliedNotice("Recommended AI Balanced Route applied to bridge navigation suite!");
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  const riskBreakdowns = [
    { label: "ICEBERG COLLISION RISK", score: riskData.icebergRisk, icon: TriangleAlert, color: "text-red-400", bar: "bg-red-500", desc: "Elevated due to A23A northern drift plume" },
    { label: "SEA-ICE PRESSURE RISK", score: riskData.seaIceRisk, icon: Snowflake, color: "text-cyan-400", bar: "bg-cyan-500", desc: "Moderate compression in Joiner Passage" },
    { label: "KATABATIC WEATHER RISK", score: riskData.weatherRisk, icon: Wind, color: "text-amber-400", bar: "bg-amber-500", desc: "55kt plateau gale front incoming" },
    { label: "VISIBILITY & SPRAY ICING", score: riskData.visibilityRisk, icon: Eye, color: "text-sky-400", bar: "bg-sky-500", desc: "Superstructure icing risk in open leads" },
    { label: "OCEAN CURRENT DRAG", score: riskData.oceanCurrentRisk, icon: Waves, color: "text-indigo-400", bar: "bg-indigo-500", desc: "Antarctic Circumpolar Current headwind" },
  ];

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              ANTARCTIC NAVIGATION RISK & HAZARD DASHBOARD
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Multi-factor Bayesian hazard matrix: Sea-ice ridging, iceberg CPA, katabatic squalls, and hydrography.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isLiveApi ? (
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              FASTAPI LIVE (/api/risk)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              OFFLINE / SIMULATION MODE
            </span>
          )}
          {appliedNotice && (
            <div className="px-3 py-1.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-mono text-xs flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{appliedNotice}</span>
            </div>
          )}
        </div>
      </div>

      {apiError && (
        <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/60 text-red-300 font-mono text-xs flex items-center justify-between">
          <span>Backend Communication Error: {apiError}</span>
          <button onClick={() => fetchRisk()} className="underline text-red-200">Retry</button>
        </div>
      )}

      {/* Interactive Vessel & Environmental Parameter Input */}
      <GlassPanel
        title="LIVE RISK ENGINE INPUT PARAMETERS"
        subtitle="Simulate Custom Position, Ice Class, and Weather Conditions (POST /api/risk)"
        icon={Compass}
      >
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs pt-1">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">LATITUDE (°S)</label>
            <input
              type="number"
              step="0.1"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || -63.4)}
              className="w-full bg-polar-950 border border-polar-750 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">LONGITUDE (°W)</label>
            <input
              type="number"
              step="0.1"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value) || -57.2)}
              className="w-full bg-polar-950 border border-polar-750 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">VESSEL POLAR CLASS</label>
            <select
              value={iceClass}
              onChange={(e) => setIceClass(e.target.value)}
              className="w-full bg-polar-950 border border-polar-750 rounded p-1.5 text-cyan-300 font-bold"
            >
              <option value="Polar Class 1 (PC1)">Polar Class 1 (PC1)</option>
              <option value="Polar Class 3 (PC3)">Polar Class 3 (PC3)</option>
              <option value="Polar Class 5 (PC5)">Polar Class 5 (PC5)</option>
              <option value="Polar Class 7 (PC7)">Polar Class 7 (PC7)</option>
              <option value="Open Water / Ice Strengthened">Open Water</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">SPEED (KNOTS)</label>
            <input
              type="number"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value) || 11.4)}
              className="w-full bg-polar-950 border border-polar-750 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">WIND SPEED (KT)</label>
            <input
              type="number"
              value={windSpeed}
              onChange={(e) => setWindSpeed(parseFloat(e.target.value) || 24.0)}
              className="w-full bg-polar-950 border border-polar-750 rounded p-1.5 text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchRisk()}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider transition-all disabled:opacity-50"
            >
              {isLoading ? "CALCULATING..." : "RE-EVALUATE"}
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Main Grid: Overall Gauge + AI Advisory Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Overall Risk Score Card (Spans 4 cols) */}
        <div className="xl:col-span-4">
          <GlassPanel
            title="OVERALL POLAR NAVIGATION RISK"
            subtitle="Polar Code Risk Envelope"
            icon={Compass}
          >
            <div className="py-4">
              <RiskGauge
                score={snapshot.riskAssessment.overallRiskScore}
                size={220}
                label="COMPOSITE HAZARD INDEX"
                subLabel="R/V POLARIS V (Polar Class PC3)"
              />
            </div>

            <div className="p-3 rounded-lg bg-polar-950/80 border border-polar-800 space-y-2 text-xs font-mono mt-2">
              <div className="flex justify-between text-slate-400">
                <span>RISK TIER:</span>
                <span className="text-amber-400 font-bold">{snapshot.riskAssessment.status}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>TREND DIRECTION:</span>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  INCREASING (Convergence in 18h)
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>LAST UPDATED:</span>
                <span className="text-slate-200">
                  {riskData.lastEvaluated.replace("T", " ").slice(0, 16)} UTC
                </span>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* AI Navigation Recommendation & Breakdown (Spans 8 cols) */}
        <div className="xl:col-span-8 space-y-4">
          {/* AI Recommendation Banner */}
          <div className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/50 shadow-cyan-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-cyan-300 font-mono font-bold text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI NAVIGATION RECOMMENDATION</span>
              </div>
              <p className="text-xs font-mono text-slate-200 leading-relaxed max-w-2xl">
                &quot;Current Route B has elevated iceberg encounter probability (64%). Route C provides a lower predicted hazard exposure (14%), passing 28 nm clear of A23A projected drift corridor.&quot;
              </p>
            </div>

            <button
              onClick={handleApplyRecommended}
              className="py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow whitespace-nowrap flex items-center space-x-1.5"
            >
              <span>APPLY RECOMMENDED ROUTE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Factor Risk Breakdown Bars */}
          <GlassPanel
            title="MULTI-FACTOR RISK BREAKDOWN"
            subtitle="Normalized Hazard Sub-Indices (0 to 100)"
            icon={ShieldAlert}
          >
            <div className="space-y-3.5 pt-1">
              {riskBreakdowns.map((factor, i) => {
                const Icon = factor.icon;
                return (
                  <div key={i} className="font-mono text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${factor.color}`} />
                        <span className="text-slate-300 font-semibold">{factor.label}</span>
                      </div>
                      <span className={`font-bold ${factor.color}`}>
                        {factor.score} / 100
                      </span>
                    </div>

                    <div className="w-full bg-polar-950 h-2 rounded-full overflow-hidden border border-polar-800">
                      <div
                        className={`h-full rounded-full ${factor.bar} transition-all duration-500`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500">{factor.desc}</div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Identified High-Risk Zones List */}
      <GlassPanel
        title="IDENTIFIED HIGH-RISK MARITIME ZONES"
        subtitle="Dynamic Polygons Generated from SAR and AMPS Telemetry"
        icon={AlertTriangle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {riskData.riskZones.map((zone) => (
            <div
              key={zone.id}
              className="p-3.5 rounded-lg bg-polar-950/80 border border-polar-800 hover:border-cyan-500/40 transition-all font-mono text-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-white block">{zone.name}</span>
                  <span className="text-[10px] text-cyan-400">
                    CENTROID: {formatCoordinates(zone.lat, zone.lng)} (Radius: {zone.radiusKm} km)
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    zone.severity === "CRITICAL"
                      ? "bg-red-950 text-red-300 border border-red-500/50"
                      : "bg-amber-950 text-amber-300 border border-amber-500/50"
                  }`}
                >
                  {zone.severity}
                </span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">
                {zone.description}
              </p>

              <div className="p-2 rounded bg-polar-900 border border-polar-800 text-[10px] text-amber-300">
                <span className="font-bold">HAZARD NOTICE: </span>
                {zone.hazardNotice}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
