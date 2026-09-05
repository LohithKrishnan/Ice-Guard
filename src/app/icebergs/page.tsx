"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  TriangleAlert,
  Search,
  Filter,
  Navigation,
  ExternalLink,
  ChevronRight,
  Sliders,
  Calendar,
  Layers,
  ArrowUpDown,
  Compass,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import { getIcebergs } from "@/services/icebergService";
import { Iceberg, RiskSeverity } from "@/services/types";
import { formatCoordinates, getRiskColor } from "@/lib/utils";
import { useNavigation } from "@/context/NavigationContext";

const AntarcticMap = dynamic(() => import("@/components/map/AntarcticMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-polar-950 flex items-center justify-center font-mono text-cyan-400 text-xs">
      INITIALIZING ICEBERG RADAR TRACKING...
    </div>
  ),
});

export default function IcebergsPage() {
  const [icebergs, setIcebergs] = useState<Iceberg[]>([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"area" | "speed" | "confidence">("area");
  const { setSelectedIcebergId, selectedIcebergId } = useNavigation();

  useEffect(() => {
    async function load() {
      const data = await getIcebergs();
      setIcebergs(data);
    }
    load();
  }, []);

  const filtered = icebergs
    .filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.calvingOrigin.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === "ALL" || b.riskTier === riskFilter;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      if (sortBy === "area") return b.sizeKm.area - a.sizeKm.area;
      if (sortBy === "speed") return b.driftSpeedKnots - a.driftSpeedKnots;
      return b.detectionConfidence - a.detectionConfidence;
    });

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <TriangleAlert className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              ANTARCTIC ICEBERG INTELLIGENCE & TRACKING CATALOG
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Continuous SAR surveillance, hydrodynamic drift physics, and calving dispersion modeling.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-polar-900 border border-polar-750 text-slate-300">
            CATALOGED GIANTS: <span className="text-cyan-300 font-bold">{icebergs.length} Tabular</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
            2 CRITICAL THREATS
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Filterable Catalog Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Map View (Spans 5 cols) */}
        <div className="xl:col-span-5 rounded-lg border border-polar-750 overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col bg-polar-950">
          <AntarcticMap />
        </div>

        {/* Catalog Table & Filters (Spans 7 cols) */}
        <div className="xl:col-span-7 space-y-3">
          {/* Controls Bar */}
          <div className="bg-polar-900/90 border border-polar-750 p-3 rounded-lg flex flex-col sm:flex-row gap-2.5 items-center justify-between text-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search iceberg ID, code, origin..."
                className="w-full bg-polar-950 border border-polar-750 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Filter and Sort options */}
            <div className="flex items-center space-x-2 w-full sm:w-auto font-mono text-xs">
              <div className="flex items-center space-x-1 bg-polar-950 rounded px-2 py-1 border border-polar-800">
                <Filter className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400 text-[10px]">RISK:</span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none text-[11px]"
                >
                  <option value="ALL">ALL TIERS</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex items-center space-x-1 bg-polar-950 rounded px-2 py-1 border border-polar-800">
                <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400 text-[10px]">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-none text-[11px]"
                >
                  <option value="area">SIZE (AREA)</option>
                  <option value="speed">DRIFT SPEED</option>
                  <option value="confidence">CONFIDENCE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Iceberg Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((berg) => {
              const isSelected = selectedIcebergId === berg.id;
              const riskColors = getRiskColor(berg.riskTier);

              return (
                <div
                  key={berg.id}
                  onClick={() => setSelectedIcebergId(berg.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-polar-850 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-polar-900/90 border-polar-750/90 hover:border-cyan-500/40"
                  }`}
                >
                  {/* Top line: Name, Code, Risk Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {berg.name}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          [{berg.code}]
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Origin: {berg.calvingOrigin}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${riskColors.badge}`}
                      >
                        {berg.riskTier} HAZARD
                      </span>
                    </div>
                  </div>

                  {/* Quantitative Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 text-[11px] font-mono">
                    <div className="p-2 rounded bg-polar-950/80 border border-polar-800">
                      <span className="text-slate-500 text-[10px] block">POSITION</span>
                      <span className="text-slate-200 font-medium">
                        {formatCoordinates(berg.latitude, berg.longitude)}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-polar-950/80 border border-polar-800">
                      <span className="text-slate-500 text-[10px] block">DIMENSIONS</span>
                      <span className="text-white font-medium">
                        {berg.sizeKm.length}×{berg.sizeKm.width} km ({berg.sizeKm.area.toLocaleString()} km²)
                      </span>
                    </div>

                    <div className="p-2 rounded bg-polar-950/80 border border-polar-800">
                      <span className="text-slate-500 text-[10px] block">DRIFT VECTOR</span>
                      <span className="text-cyan-300 font-medium">
                        {berg.driftSpeedKnots} kt @ {berg.driftDirectionDeg}°
                      </span>
                    </div>

                    <div className="p-2 rounded bg-polar-950/80 border border-polar-800">
                      <span className="text-slate-500 text-[10px] block">RADAR CONFIDENCE</span>
                      <span className="text-emerald-400 font-bold">
                        {berg.detectionConfidence}%
                      </span>
                    </div>
                  </div>

                  {/* Footer description & Actions */}
                  <div className="pt-2 border-t border-polar-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 text-[11px] line-clamp-1 flex-1 font-mono">
                      {berg.description}
                    </span>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Link
                        href={`/icebergs/${berg.id}`}
                        className="py-1 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-semibold text-[11px] transition-colors flex items-center space-x-1 shadow-cyan-glow"
                      >
                        <span>TRAJECTORY DEEP DIVE</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
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
