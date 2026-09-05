"use client";

import React from "react";
import {
  Layers,
  Snowflake,
  TriangleAlert,
  Navigation,
  Ship,
  Wind,
  Waves,
  Satellite,
  Maximize2,
  Compass,
} from "lucide-react";
import { useNavigation, MapLayerState } from "@/context/NavigationContext";

interface MapLayerControlProps {
  onSelectSector?: (sector: "weddell" | "ross" | "drake" | "overview") => void;
}

export default function MapLayerControl({ onSelectSector }: MapLayerControlProps) {
  const { layers, toggleLayer, projectionMode, setProjectionMode } = useNavigation();

  const layerButtons: Array<{
    key: keyof MapLayerState;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    { key: "seaIce", label: "Sea Ice", icon: Snowflake, color: "text-sky-400" },
    { key: "icebergs", label: "Icebergs", icon: TriangleAlert, color: "text-cyan-400" },
    { key: "trajectories", label: "Trajectories", icon: Navigation, color: "text-teal-400" },
    { key: "vessels", label: "Vessels", icon: Ship, color: "text-blue-400" },
    { key: "riskZones", label: "Risk Zones", icon: TriangleAlert, color: "text-rose-400" },
    { key: "currents", label: "Currents", icon: Waves, color: "text-indigo-400" },
    { key: "weather", label: "Weather", icon: Wind, color: "text-amber-400" },
    { key: "satellite", label: "Satellite Swath", icon: Satellite, color: "text-purple-400" },
  ];

  return (
    <div className="bg-polar-950/90 backdrop-blur-md border border-polar-750/80 rounded-lg p-2.5 shadow-xl text-xs space-y-2.5 max-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-polar-800">
        <div className="flex items-center space-x-1.5 font-mono font-semibold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>TACTICAL LAYERS</span>
        </div>
        <button
          onClick={() =>
            setProjectionMode(projectionMode === "mercator" ? "polar" : "mercator")
          }
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
            projectionMode === "polar"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
              : "bg-polar-900 text-slate-400 border-polar-750 hover:text-white"
          }`}
          title="Toggle South Polar Radar Projection"
        >
          {projectionMode === "polar" ? "POLAR EPSG:3031" : "MERCATOR"}
        </button>
      </div>

      {/* Toggles Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {layerButtons.map(({ key, label, icon: Icon, color }) => {
          const active = layers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center space-x-1.5 px-2 py-1.5 rounded transition-all text-left ${
                active
                  ? "bg-polar-850/90 text-white border border-cyan-500/30 shadow-sm"
                  : "bg-polar-900/50 text-slate-500 border border-transparent hover:text-slate-300 hover:bg-polar-900"
              }`}
            >
              <Icon className={`w-3 h-3 ${active ? color : "text-slate-500"}`} />
              <span className="truncate text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Sector Quick Jump */}
      {onSelectSector && (
        <div className="pt-2 border-t border-polar-800 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            QUICK SECTORS
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <button
              onClick={() => onSelectSector("weddell")}
              className="px-1.5 py-1 rounded bg-polar-900 hover:bg-polar-800 text-slate-300 hover:text-cyan-300 border border-polar-800 text-center"
            >
              Weddell / A23A
            </button>
            <button
              onClick={() => onSelectSector("ross")}
              className="px-1.5 py-1 rounded bg-polar-900 hover:bg-polar-800 text-slate-300 hover:text-cyan-300 border border-polar-800 text-center"
            >
              Ross Sea
            </button>
            <button
              onClick={() => onSelectSector("drake")}
              className="px-1.5 py-1 rounded bg-polar-900 hover:bg-polar-800 text-slate-300 hover:text-cyan-300 border border-polar-800 text-center"
            >
              Drake Passage
            </button>
            <button
              onClick={() => onSelectSector("overview")}
              className="px-1.5 py-1 rounded bg-polar-900 hover:bg-polar-800 text-slate-300 hover:text-cyan-300 border border-polar-800 text-center"
            >
              All Antarctica
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
