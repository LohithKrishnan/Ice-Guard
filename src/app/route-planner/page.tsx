"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Navigation,
  Ship,
  Sparkles,
  ShieldAlert,
  Clock,
  Fuel,
  Compass,
  CheckCircle2,
  Sliders,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import { getRouteOptions, generateCustomRoute, DEFAULT_VESSEL } from "@/services/routeService";
import { RouteOption } from "@/services/types";
import { useSimulation } from "@/context/SimulationContext";
import { formatCoordinates } from "@/lib/utils";

const AntarcticMap = dynamic(() => import("@/components/map/AntarcticMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-polar-950 flex items-center justify-center font-mono text-cyan-400 text-xs">
      CALCULATING PARETO-OPTIMAL ICE CORRIDORS...
    </div>
  ),
});

export default function RoutePlannerPage() {
  const { activeRouteId, setActiveRouteId } = useSimulation();

  // Route Form State
  const [startLat, setStartLat] = useState<number>(-63.4);
  const [startLng, setStartLng] = useState<number>(-57.2);
  const [destLat, setDestLat] = useState<number>(-56.2);
  const [destLng, setDestLng] = useState<number>(-39.8);
  const [vesselType, setVesselType] = useState<string>("Polar Research Vessel");
  const [vesselSpeed, setVesselSpeed] = useState<number>(11.4);
  const [iceClass, setIceClass] = useState<string>("Polar Class 3 (PC3)");
  const [draft, setDraft] = useState<number>(8.4);
  const [maxRisk, setMaxRisk] = useState<number>(65);
  const [departureTime, setDepartureTime] = useState<string>("2026-09-05T06:00");

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const initialRoutes = await getRouteOptions();
      setRoutes(initialRoutes);
      setSelectedRoute(initialRoutes.find((r) => r.isRecommended) || initialRoutes[0]);
    }
    init();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const generated = await generateCustomRoute({
        startLat,
        startLng,
        destLat,
        destLng,
        vesselIceClass: iceClass,
        maxRiskScore: maxRisk,
      });
      setRoutes(generated);
      setSelectedRoute(generated.find((r) => r.isRecommended) || generated[0]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyRoute = (route: RouteOption) => {
    setActiveRouteId(route.id);
    setSelectedRoute(route);
    setAppliedToast(`Autopilot updated: ${route.name} is now the active voyage plan!`);
    setTimeout(() => setAppliedToast(null), 4000);
  };

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              AI MARITIME ROUTE OPTIMIZATION ENGINE
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Polar Code IMO Chapter 3 compliant dynamic pathfinding with SAR ice pack and iceberg avoidance.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FASTAPI LIVE (/api/routes/optimize)
          </span>
          {appliedToast && (
            <div className="px-3 py-1.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-mono text-xs flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{appliedToast}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Route Parameters Form & Route Evaluation */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Form: Route Parameters (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <GlassPanel
            title="VOYAGE & VESSEL PARAMETERS"
            subtitle="Polar Navigation Constraint Inputs"
            icon={Ship}
          >
            <form onSubmit={handleGenerate} className="space-y-3.5 text-xs font-mono">
              {/* Waypoints Input */}
              <div className="p-3 rounded-lg bg-polar-950/80 border border-polar-800 space-y-2.5">
                <div className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">
                  WAYPOINTS (DECIMAL DEGREES)
                </div>

                {/* Start Location */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    START LOCATION (CURRENT POSITION)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={startLat}
                      onChange={(e) => setStartLat(parseFloat(e.target.value))}
                      className="bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={startLng}
                      onChange={(e) => setStartLng(parseFloat(e.target.value))}
                      className="bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                      placeholder="Longitude"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    DESTINATION (SOUTH GEORGIA GATEWAY)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={destLat}
                      onChange={(e) => setDestLat(parseFloat(e.target.value))}
                      className="bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={destLng}
                      onChange={(e) => setDestLng(parseFloat(e.target.value))}
                      className="bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>

              {/* Vessel Telemetry Info */}
              <div className="p-3 rounded-lg bg-polar-950/80 border border-polar-800 space-y-2.5">
                <div className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">
                  VESSEL CHARACTERISTICS
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ICE CLASS</label>
                    <select
                      value={iceClass}
                      onChange={(e) => setIceClass(e.target.value)}
                      className="w-full bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                    >
                      <option>Polar Class 3 (PC3)</option>
                      <option>Polar Class 1 (PC1 Heavy)</option>
                      <option>Polar Class 5 (PC5 Medium)</option>
                      <option>Polar Class 7 (PC7 Light)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">SPEED (KNOTS)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={vesselSpeed}
                      onChange={(e) => setVesselSpeed(parseFloat(e.target.value))}
                      className="w-full bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">DRAFT (METERS)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={draft}
                      onChange={(e) => setDraft(parseFloat(e.target.value))}
                      className="w-full bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">MAX RISK (0-100)</label>
                    <input
                      type="number"
                      value={maxRisk}
                      onChange={(e) => setMaxRisk(parseInt(e.target.value))}
                      className="w-full bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">DEPARTURE TIME (UTC)</label>
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-polar-900 border border-polar-750 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              {/* Generate AI Route Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider uppercase transition-all shadow-cyan-glow flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SOLVING 4D ICE TRAJECTORIES...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>GENERATE AI ROUTE</span>
                  </>
                )}
              </button>
            </form>
          </GlassPanel>
        </div>

        {/* Right Section: Map & Comparative Route Cards (8 cols) */}
        <div className="xl:col-span-8 space-y-4">
          {/* Interactive Route Map */}
          <div className="rounded-lg border border-polar-750 overflow-hidden shadow-2xl relative min-h-[440px] flex flex-col bg-polar-950">
            <AntarcticMap />
          </div>

          {/* 3 Comparative Route Cards: SAFE, FAST, BALANCED AI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {routes.map((r) => {
              const isSelected = selectedRoute?.id === r.id;
              const isActiveVoyage = activeRouteId === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoute(r)}
                  className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all cursor-pointer ${
                    r.isRecommended
                      ? "bg-polar-850/90 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/40"
                      : isSelected
                      ? "bg-polar-900 border-polar-600"
                      : "bg-polar-900/70 border-polar-800 hover:border-polar-700"
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-white">
                        {r.name}
                      </span>
                      {r.isRecommended && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-400">
                          RECOMMENDED
                        </span>
                      )}
                      {isActiveVoyage && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      {r.tagline}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 my-3 text-[11px] font-mono">
                      <div className="p-2 rounded bg-polar-950 border border-polar-800">
                        <span className="text-slate-500 text-[9px] block">DISTANCE</span>
                        <span className="text-white font-bold">{r.distanceNm} nm</span>
                      </div>

                      <div className="p-2 rounded bg-polar-950 border border-polar-800">
                        <span className="text-slate-500 text-[9px] block">EST. TIME</span>
                        <span className="text-white font-bold">{r.estimatedHours} hrs</span>
                      </div>

                      <div className="p-2 rounded bg-polar-950 border border-polar-800">
                        <span className="text-slate-500 text-[9px] block">RISK SCORE</span>
                        <span
                          className={`font-bold ${
                            r.riskScore < 35
                              ? "text-emerald-400"
                              : r.riskScore < 60
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {r.riskScore} / 100
                        </span>
                      </div>

                      <div className="p-2 rounded bg-polar-950 border border-polar-800">
                        <span className="text-slate-500 text-[9px] block">ICE EXPOSURE</span>
                        <span className="text-cyan-300 font-bold">{r.iceExposurePercent}%</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 pb-2 border-b border-polar-800 space-y-1">
                      <div className="flex justify-between">
                        <span>Iceberg Encounter:</span>
                        <span
                          className={`font-semibold ${
                            r.icebergEncounterProbability > 40
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {r.icebergEncounterProbability}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stand-Off Margin:</span>
                        <span className="text-slate-200">+{r.safetyBufferNm} nm</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono mt-2 line-clamp-2">
                      {r.hazardSummary}
                    </p>
                  </div>

                  {/* Apply Route Button */}
                  <div className="mt-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyRoute(r);
                      }}
                      className={`w-full py-1.5 px-3 rounded font-mono font-bold text-xs transition-all ${
                        isActiveVoyage
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                          : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-glow"
                      }`}
                    >
                      {isActiveVoyage ? "ACTIVE AUTOPILOT COURSE" : "APPLY THIS ROUTE"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
