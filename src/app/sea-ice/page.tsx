"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Snowflake,
  TrendingDown,
  Wind,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Compass,
  ArrowUpRight,
  Maximize2,
} from "lucide-react";
import KpiCard from "@/components/common/KpiCard";
import GlassPanel from "@/components/common/GlassPanel";
import { getSeaIceData } from "@/services/seaIceService";
import { SeaIceData } from "@/services/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AntarcticMap = dynamic(() => import("@/components/map/AntarcticMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-polar-950 flex items-center justify-center font-mono text-cyan-400 text-xs">
      LOADING SEA-ICE RADAR LAYERS...
    </div>
  ),
});

export default function SeaIcePage() {
  const [data, setData] = useState<SeaIceData | null>(null);
  const [activeForecast, setActiveForecast] = useState<24 | 48 | 72>(24);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIce() {
      setLoading(true);
      const res = await getSeaIceData();
      setData(res);
      setLoading(false);
    }
    fetchIce();
  }, []);

  if (!data) {
    return (
      <div className="p-8 font-mono text-cyan-400 flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>PROCESSING SYNTHETIC APERTURE RADAR (SAR) ICE PACK DATA...</span>
      </div>
    );
  }

  const selectedForecast = data.forecastTimeline.find((f) => f.hours === activeForecast) || data.forecastTimeline[0];

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <Snowflake className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              SEA-ICE INTELLIGENCE & THICKNESS FORECAST
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            AMSR2 Microwave Radiometry & Sentinel-1 SAR high-resolution cryospheric modeling.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2 py-1 rounded bg-polar-900 border border-polar-750 text-slate-300">
            TREND: <span className="text-sky-300 font-bold">RETREATING (-18.4 km/day)</span>
          </span>
          <span className="px-2 py-1 rounded bg-polar-900 border border-polar-750 text-slate-300">
            MEAN THICKNESS: <span className="text-cyan-300 font-bold">{data.meanThicknessM}m</span>
          </span>
        </div>
      </div>

      {/* 4 Core KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="SEA-ICE CONCENTRATION"
          value={`${data.overallCoveragePercent}%`}
          change="-0.8% (72h Net)"
          trend="down"
          trendSeverity="positive"
          icon={Snowflake}
          colorScheme="cyan"
          footerNotice="AMSR2 Level-3 Grid"
        />
        <KpiCard
          label="MEAN ICE THICKNESS"
          value={`${data.meanThicknessM} m`}
          change="Multi-Year Dominant"
          trend="neutral"
          icon={Layers}
          colorScheme="blue"
          footerNotice="ICESat-2 Laser Altimetry"
        />
        <KpiCard
          label="DRIFT VELOCITY"
          value={`${data.driftSpeedKnots} kt`}
          subValue={`@ ${data.driftDirectionDeg}°`}
          change="Ekman Driven"
          trend="up"
          icon={Wind}
          colorScheme="emerald"
          footerNotice="Real-time Buoy Network"
        />
        <KpiCard
          label="ICE RETREAT RATE"
          value={`${data.retreatVelocityKmPerDay} km`}
          subValue="/ day"
          change="Spring Thaw Onset"
          trend="up"
          trendSeverity="warning"
          icon={TrendingDown}
          colorScheme="amber"
          footerNotice="Circumpolar Edge Model"
        />
      </div>

      {/* Main Grid: Map & Predictive Forecast */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Interactive Tactical Map for Sea-Ice */}
        <div className="xl:col-span-2 rounded-lg border border-polar-750 overflow-hidden shadow-2xl relative min-h-[440px] flex flex-col bg-polar-950">
          <AntarcticMap />
        </div>

        {/* Predictive Forecast Panel */}
        <GlassPanel
          title="PREDICTIVE ICE-EDGE & DRIFT FORECAST"
          subtitle="Spatio-Temporal ConvLSTM Neural Network"
          icon={Sparkles}
        >
          {/* Forecast Horizon Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-polar-950 p-1 rounded-lg border border-polar-800 text-xs font-mono mb-4">
            {([24, 48, 72] as const).map((hrs) => (
              <button
                key={hrs}
                onClick={() => setActiveForecast(hrs)}
                className={`py-2 rounded font-semibold transition-all ${
                  activeForecast === hrs
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                +{hrs} HOURS
              </button>
            ))}
          </div>

          {/* Active Forecast Metric Cards */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-polar-950/80 border border-polar-800">
              <div className="flex items-center justify-between text-slate-400">
                <span>PREDICTION CONFIDENCE</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {selectedForecast.confidence}%
                </span>
              </div>
              <div className="w-full bg-polar-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${selectedForecast.confidence}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded bg-polar-950/80 border border-polar-800">
                <span className="text-slate-400 text-[10px] block">MEAN CONCENTRATION</span>
                <span className="text-cyan-300 font-bold text-base">
                  {selectedForecast.meanConcentration}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Δ {selectedForecast.growthRate}% / day
                </span>
              </div>

              <div className="p-3 rounded bg-polar-950/80 border border-polar-800">
                <span className="text-slate-400 text-[10px] block">ICE EDGE SHIFT</span>
                <span className="text-amber-400 font-bold text-base">
                  {selectedForecast.edgeDisplacementKm} km
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Southward Retreat
                </span>
              </div>
            </div>

            {/* Ice Navigation Advisory */}
            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-cyan-300 block mb-1">
                TACTICAL BRIDGE ADVISORY (+{activeForecast}H):
              </span>
              Expect widening of shear leads along the eastern Antarctic Peninsula. Vessels transiting Joiner Passage should monitor compressive floe convergence between 02:00 and 08:00 UTC.
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Analytical Charts Grid: Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Sea-Ice Concentration Over Time */}
        <GlassPanel
          title="CONCENTRATION OVER TIME (AUGUST - SEPTEMBER)"
          subtitle="AMSR2 Multi-Spectral Microwave Inversion"
          icon={Snowflake}
        >
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.historicalCoverage}>
                <defs>
                  <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[75, 86]} stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#060d1f",
                    borderColor: "#00F0FF",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="coverage"
                  name="Coverage %"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#coverageGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Chart 2: Ice Thickness Distribution */}
        <GlassPanel
          title="ICE THICKNESS STRATIFICATION"
          subtitle="ICESat-2 ATLAS & CryoSat-2 Altimetry"
          icon={Layers}
        >
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.thicknessDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis
                  type="category"
                  dataKey="range"
                  stroke="#64748b"
                  width={70}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#060d1f",
                    borderColor: "#38bdf8",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="percentage" name="% Composition" radius={[0, 4, 4, 0]}>
                  {data.thicknessDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Chart 3: Ice Drift Speed & Wind Coupling */}
        <GlassPanel
          title="ICE DRIFT SPEED & KINEMATICS"
          subtitle="Sub-Daily Kinematic Drift Analysis (Knots)"
          icon={Wind}
        >
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.driftSpeedHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0.4, 0.9]} stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#060d1f",
                    borderColor: "#34d399",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="velocityKnots"
                  name="Drift (knots)"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ fill: "#34d399", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
