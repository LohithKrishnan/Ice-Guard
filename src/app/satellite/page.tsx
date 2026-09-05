"use client";

import React, { useEffect, useState } from "react";
import {
  Satellite,
  Layers,
  Sliders,
  Calendar,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import KpiCard from "@/components/common/KpiCard";
import { getSatellitePasses } from "@/services/satelliteService";
import { SatellitePass } from "@/services/types";

export default function SatellitePage() {
  const [passes, setPasses] = useState<SatellitePass[]>([]);
  const [selectedPass, setSelectedPass] = useState<SatellitePass | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100% for Before/After split
  const [opacity, setOpacity] = useState<number>(85);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeLayerFilter, setActiveLayerFilter] = useState<"ALL" | "SAR" | "OPTICAL" | "THERMAL">("ALL");

  useEffect(() => {
    async function load() {
      const data = await getSatellitePasses();
      setPasses(data);
      setSelectedPass(data[0]);
    }
    load();
  }, []);

  if (!selectedPass) {
    return (
      <div className="p-8 font-mono text-cyan-400 flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>CONNECTING TO COPERNICUS POLAR GROUND STATIONS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <Satellite className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              SATELLITE REMOTE SENSING & SAR IMAGERY INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Copernicus Sentinel-1 SAR C-Band radar, Sentinel-2 MSI, and NASA Aqua MODIS thermal swath pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-polar-900 border border-polar-750 text-slate-300">
            RADAR UPLINK: <span className="text-emerald-400 font-bold">SYNCHRONIZED (TROLL/SVALBARD)</span>
          </span>
        </div>
      </div>

      {/* Satellite Metadata KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="ACQUISITION TIMESTAMP"
          value={selectedPass.acquisitionTime.slice(11, 19)}
          subValue="UTC"
          change={selectedPass.acquisitionTime.slice(0, 10)}
          trend="neutral"
          icon={Calendar}
          colorScheme="cyan"
          footerNotice={`${selectedPass.orbitPass} Orbit Pass`}
        />
        <KpiCard
          label="SPATIAL RESOLUTION"
          value={`${selectedPass.resolutionM} m`}
          subValue="/ pixel"
          change={`Swath: ${selectedPass.swathWidthKm} km`}
          trend="neutral"
          icon={Layers}
          colorScheme="blue"
          footerNotice={selectedPass.spectralBands}
        />
        <KpiCard
          label="CLOUD PENETRATION"
          value={selectedPass.cloudCoveragePercent === 0 ? "100% SAR" : `${selectedPass.cloudCoveragePercent}%`}
          change={selectedPass.satellite === "Sentinel-1" ? "Radar Penetrates All Clouds" : "Optical Attenuated"}
          trend="neutral"
          icon={Eye}
          colorScheme="emerald"
          footerNotice="All-Weather Synthetic Aperture"
        />
        <KpiCard
          label="CALIBRATED DATA QUALITY"
          value={`${selectedPass.dataQualityPercent}%`}
          change="Radiometrically Terrain-Corrected"
          trend="up"
          icon={Sparkles}
          colorScheme="amber"
          footerNotice="Level-1 GRD Polarimetric"
        />
      </div>

      {/* Main Grid: Large Imagery Viewer + Source Feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Large Interactive Imagery Viewer with Before/After Slider (Spans 8 cols) */}
        <div className="xl:col-span-8 space-y-3">
          <div className="bg-polar-900 border border-polar-750 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Satellite className="w-4 h-4 text-cyan-400" />
                {selectedPass.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px]">
                {selectedPass.imageryType}
              </span>
            </div>

            {/* Viewer Controls: Opacity & Zoom */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[10px]">OPACITY:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-20 accent-cyan-400 cursor-pointer"
                />
                <span className="text-cyan-300 w-8 text-right">{opacity}%</span>
              </div>

              <div className="flex items-center space-x-1 bg-polar-950 rounded px-1.5 py-0.5 border border-polar-800">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                  className="p-1 hover:text-white text-slate-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-200 text-[10px] px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(180, z + 10))}
                  className="p-1 hover:text-white text-slate-400"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Before/After Split Viewer Box */}
          <div className="relative w-full h-[520px] bg-polar-950 rounded-lg border border-polar-750 overflow-hidden select-none group">
            {/* Base "After" Image / Current SAR Radar View */}
            <div
              className="absolute inset-0 transition-transform duration-100 flex items-center justify-center bg-gradient-to-br from-slate-950 via-polar-900 to-slate-950"
              style={{
                opacity: opacity / 100,
                transform: `scale(${zoomLevel / 100})`,
              }}
            >
              {/* Synthetic Radar Canvas Simulation */}
              <svg className="w-full h-full" viewBox="0 0 1000 700">
                {/* Speckle Noise Radar Graticule */}
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0e2a47" strokeWidth="0.5" />
                </pattern>
                <rect width="1000" height="700" fill="url(#radarGrid)" />

                {/* Simulated Radar Backscatter of Sea-Ice Pack (CURRENT: T-0h) */}
                <g opacity="0.85">
                  <path
                    d="M 50,120 Q 300,90 550,160 T 950,140 L 980,680 L 40,680 Z"
                    fill="#0c2d48"
                    stroke="#00F0FF"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  {/* Calved mega-iceberg A23A radar reflection */}
                  <rect
                    x="560"
                    y="240"
                    width="140"
                    height="50"
                    rx="4"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="2"
                    transform="rotate(18, 630, 265)"
                  />
                  <text
                    x="620"
                    y="240"
                    fill="#ffffff"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    A23A CURRENT POSITION (SEP 05)
                  </text>

                  {/* High radar backscatter ridges */}
                  <path
                    d="M 180,320 Q 340,360 480,280 Q 620,380 750,330"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    strokeOpacity="0.7"
                  />
                </g>
              </svg>
            </div>

            {/* Overlaid "Before" Image (Clipped by Split Slider) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-400 shadow-[0_0_20px_#00F0FF]"
              style={{ width: `${sliderPosition}%` }}
            >
              <div
                className="absolute inset-y-0 left-0 w-[1000px] h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-polar-950 to-slate-950"
                style={{
                  opacity: opacity / 100,
                  transform: `scale(${zoomLevel / 100})`,
                }}
              >
                <svg className="w-full h-full" viewBox="0 0 1000 700">
                  <rect width="1000" height="700" fill="url(#radarGrid)" />
                  {/* BASELINE T-7 DAYS (AUG 28) */}
                  <g opacity="0.75">
                    <path
                      d="M 50,140 Q 300,110 550,180 T 950,160 L 980,680 L 40,680 Z"
                      fill="#071b30"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    {/* A23A Position 7 Days Ago */}
                    <rect
                      x="510"
                      y="280"
                      width="140"
                      height="50"
                      rx="4"
                      fill="#64748b"
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                      transform="rotate(12, 580, 305)"
                    />
                    <text
                      x="520"
                      y="275"
                      fill="#cbd5e1"
                      fontSize="13"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      A23A BASELINE (AUG 28)
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Split Slider Handle Bar */}
            <div
              className="absolute inset-y-0 pointer-events-none flex items-center justify-center"
              style={{ left: `calc(${sliderPosition}% - 14px)` }}
            >
              <div className="w-7 h-7 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-cyan-glow cursor-ew-resize pointer-events-auto">
                ⇄
              </div>
            </div>

            {/* Interactive invisible slider input covering the viewer */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(parseInt(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
            />

            {/* Labels in corner */}
            <div className="absolute top-3 left-3 bg-polar-950/80 px-2.5 py-1 rounded border border-polar-750 text-[10px] font-mono text-slate-300">
              BASELINE: 2026-08-28 (7 DAYS PRIOR)
            </div>
            <div className="absolute top-3 right-3 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
              CURRENT SAR: 2026-09-05 (FRESH PASS)
            </div>

            {/* Bottom Floating Delta HUD */}
            <div className="absolute bottom-3 inset-x-3 bg-polar-950/90 backdrop-blur-md border border-polar-750 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="text-cyan-400 font-bold">ICE KINEMATIC SHIFT:</span>
                <span className="text-white">+18.6 km North-Northwest displacement</span>
                <span className="text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-[10px]">
                  FRACTURE DETECTED (NORTH RIFT)
                </span>
              </div>
              <span className="text-slate-500 text-[10px]">DRAG SLIDER TO COMPARE</span>
            </div>
          </div>
        </div>

        {/* Right: Satellite Source Selection (Spans 4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <GlassPanel
            title="AVAILABLE SATELLITE PASSES"
            subtitle="Polar Orbital Multi-Sensor Roster"
            icon={Layers}
          >
            <div className="space-y-2.5">
              {passes.map((p) => {
                const isSelected = selectedPass.id === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPass(p)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer font-mono text-xs space-y-1.5 ${
                      isSelected
                        ? "bg-polar-850 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-polar-950/80 border-polar-800 hover:border-polar-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-polar-900 border border-polar-750 text-cyan-300">
                        {p.satellite}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Sensor: <span className="text-slate-200">{p.sensorType}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1 border-t border-polar-800">
                      <div>ACQUIRED: {p.acquisitionTime.slice(11, 16)} UTC</div>
                      <div>RES: {p.resolutionM}m / pixel</div>
                      <div>SWATH: {p.swathWidthKm} km</div>
                      <div className="text-emerald-400">QUALITY: {p.dataQualityPercent}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-polar-950/80 border border-polar-800 text-[11px] font-mono text-slate-400 leading-relaxed">
              <span className="font-bold text-white block mb-1">RADAR PASS HIGHLIGHT:</span>
              Sentinel-1 Synthetic Aperture Radar operates in C-band (5.405 GHz), piercing dense cloud cover and polar night to measure backscatter roughness and distinguish first-year from multi-year ice.
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
