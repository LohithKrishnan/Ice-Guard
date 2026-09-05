"use client";

import React from "react";
import {
  LineChart as LucideLineChart,
  Calendar,
  Fuel,
  ShieldCheck,
  TrendingDown,
  Layers,
  Sparkles,
  BarChart2,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import KpiCard from "@/components/common/KpiCard";
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
  Legend,
  Cell,
} from "recharts";

const MULTI_YEAR_ICE_TRENDS = [
  { year: "2019", summerMinMillionSqKm: 2.31, winterMaxMillionSqKm: 18.4 },
  { year: "2020", summerMinMillionSqKm: 2.68, winterMaxMillionSqKm: 18.9 },
  { year: "2021", summerMinMillionSqKm: 2.60, winterMaxMillionSqKm: 18.7 },
  { year: "2022", summerMinMillionSqKm: 1.98, winterMaxMillionSqKm: 18.2 },
  { year: "2023", summerMinMillionSqKm: 1.79, winterMaxMillionSqKm: 16.9 },
  { year: "2024", summerMinMillionSqKm: 1.99, winterMaxMillionSqKm: 17.1 },
  { year: "2025", summerMinMillionSqKm: 1.92, winterMaxMillionSqKm: 17.0 },
  { year: "2026", summerMinMillionSqKm: 1.88, winterMaxMillionSqKm: 16.8 },
];

const CALVING_BY_SHELF = [
  { shelf: "Filchner-Ronne", count: 18, massGt: 1450, fill: "#00F0FF" },
  { shelf: "Ross", count: 12, massGt: 820, fill: "#38BDF8" },
  { shelf: "Amery", count: 9, massGt: 640, fill: "#0284C7" },
  { shelf: "Brunt", count: 14, massGt: 590, fill: "#0369A1" },
  { shelf: "Pine Island / Thwaites", count: 26, massGt: 1280, fill: "#EF4444" },
];

const ROUTE_EFFICIENCY_GAINS = [
  { metric: "Vessel Besetting Incidents", traditionalManual: 14, aiOptimized: 1, reduction: "-92.8%" },
  { metric: "Heavy Ice Floe Collisions", traditionalManual: 22, aiOptimized: 3, reduction: "-86.4%" },
  { metric: "Mean Transit Fuel (Tons/Voyage)", traditionalManual: 68.4, aiOptimized: 44.2, reduction: "-35.3%" },
  { metric: "Transit Passage Time (Hours)", traditionalManual: 138, aiOptimized: 106, reduction: "-23.2%" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <LucideLineChart className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              CLIMATOLOGICAL & VOYAGE ANALYTICS INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Long-term Southern Ocean cryospheric trends, calving frequency indices, and route efficiency metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-polar-900 border border-polar-750 text-slate-300">
            RECORD ARCHIVE: <span className="text-cyan-300 font-bold">1979 - 2026</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="MULTI-YEAR MINIMUM"
          value="1.88M"
          subValue="km²"
          change="-28% vs 1981-2010 Mean"
          trend="down"
          trendSeverity="warning"
          icon={TrendingDown}
          colorScheme="amber"
          footerNotice="Antarctic Summer Minimum"
        />
        <KpiCard
          label="ANNUAL CALVED MASS"
          value="4,780 Gt"
          change="+18% Above Decadal Mean"
          trend="up"
          trendSeverity="warning"
          icon={Layers}
          colorScheme="rose"
          footerNotice="All 5 Major Ice Shelves"
        />
        <KpiCard
          label="AI PASSAGE FUEL SAVINGS"
          value="35.3%"
          change="Average 24.2 tons/passage"
          trend="down"
          trendSeverity="positive"
          icon={Fuel}
          colorScheme="emerald"
          footerNotice="Pareto Route Optimizer"
        />
        <KpiCard
          label="COLLISION PROBABILITY REDUCTION"
          value="86.4%"
          change="95% CI Stand-Off Clearance"
          trend="down"
          trendSeverity="positive"
          icon={ShieldCheck}
          colorScheme="cyan"
          footerNotice="Zero Hull Breaches Recorded"
        />
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Multi-Year Sea Ice Extent Cycle */}
        <GlassPanel
          title="MULTI-YEAR ANTARCTIC SEA-ICE EXTENT (2019 - 2026)"
          subtitle="Summer Minimum vs Winter Maximum Extents (Million Sq Km)"
          icon={Calendar}
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MULTI_YEAR_ICE_TRENDS}>
                <defs>
                  <linearGradient id="winterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="summerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 22]} unit="M" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#060d1f",
                    borderColor: "#00F0FF",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "6px" }} />
                <Area
                  type="monotone"
                  dataKey="winterMaxMillionSqKm"
                  name="Winter Maximum (M km²)"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fill="url(#winterGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="summerMinMillionSqKm"
                  name="Summer Minimum (M km²)"
                  stroke="#00F0FF"
                  strokeWidth={2}
                  fill="url(#summerGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Chart 2: Major Ice Shelf Calving Discharges */}
        <GlassPanel
          title="ICEBERG CALVING DISCHARGE BY REGION"
          subtitle="Estimated Calved Ice Volume (Gigatons) & Event Frequency"
          icon={BarChart2}
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CALVING_BY_SHELF}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="shelf" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} unit=" Gt" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#060d1f",
                    borderColor: "#38bdf8",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="massGt" name="Mass (Gigatons)" radius={[4, 4, 0, 0]}>
                  {CALVING_BY_SHELF.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* Comparative Route Efficiency Table */}
      <GlassPanel
        title="OPERATIONAL PERFORMANCE: TRADITIONAL NAVIGATION VS ICEGUARD AI"
        subtitle="Polar Code Audited Passage Metrics Over 140 Antarctic Transits"
        icon={Sparkles}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-polar-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">METRIC PARAMETER</th>
                <th className="py-2.5 px-3">TRADITIONAL ROUTING</th>
                <th className="py-2.5 px-3">ICEGUARD AI ROUTING</th>
                <th className="py-2.5 px-3">SAFETY / EFFICIENCY GAIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-800/60">
              {ROUTE_EFFICIENCY_GAINS.map((row, i) => (
                <tr key={i} className="hover:bg-polar-950/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white">{row.metric}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.traditionalManual}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">{row.aiOptimized}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{row.reduction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
