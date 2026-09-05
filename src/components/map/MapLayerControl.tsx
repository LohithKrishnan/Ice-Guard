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
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }> = [
    { key: "seaIce",      label: "Sea Ice",      icon: Snowflake    },
    { key: "icebergs",    label: "Icebergs",     icon: TriangleAlert },
    { key: "trajectories",label: "Trajectories", icon: Navigation   },
    { key: "vessels",     label: "Vessels",      icon: Ship         },
    { key: "riskZones",   label: "Risk Zones",   icon: TriangleAlert },
    { key: "currents",    label: "Currents",     icon: Waves        },
    { key: "weather",     label: "Weather",      icon: Wind         },
    { key: "satellite",   label: "SAR Swath",    icon: Satellite    },
  ];

  const panelStyle: React.CSSProperties = {
    background: "rgba(13,13,13,0.96)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 12,
    backdropFilter: "blur(16px)",
    maxWidth: 260,
    boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div
        className="flex items-center justify-between pb-2 mb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3 h-3" style={{ color: "#B8A58A" }} />
          <span
            className="uppercase tracking-widest font-semibold"
            style={{ color: "#F2F0EB", fontSize: 9, letterSpacing: "0.15em" }}
          >
            Tactical Layers
          </span>
        </div>
        <button
          onClick={() => setProjectionMode(projectionMode === "mercator" ? "polar" : "mercator")}
          className="font-mono transition-all"
          style={{
            fontSize: 9,
            padding: "3px 8px",
            borderRadius: 4,
            background: projectionMode === "polar" ? "rgba(184,165,138,0.12)" : "rgba(255,255,255,0.04)",
            color: projectionMode === "polar" ? "#B8A58A" : "#4A4540",
            border: projectionMode === "polar" ? "1px solid rgba(184,165,138,0.2)" : "1px solid rgba(255,255,255,0.06)",
            letterSpacing: "0.1em",
          }}
        >
          {projectionMode === "polar" ? "POLAR" : "MERCATOR"}
        </button>
      </div>

      {/* Layer toggles */}
      <div className="grid grid-cols-2 gap-1">
        {layerButtons.map(({ key, label, icon: Icon }) => {
          const active = layers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className="flex items-center gap-1.5 rounded text-left transition-all"
              style={{
                padding: "6px 8px",
                fontSize: 10,
                background: active ? "rgba(184,165,138,0.08)" : "rgba(255,255,255,0.02)",
                color: active ? "#F2F0EB" : "#4A4540",
                border: active ? "1px solid rgba(184,165,138,0.15)" : "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Icon className="w-3 h-3 flex-shrink-0" style={{ color: active ? "#B8A58A" : "#2A2A2A" }} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick sector jump */}
      {onSelectSector && (
        <div className="mt-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            className="uppercase tracking-widest mb-2"
            style={{ color: "#4A4540", fontSize: 9, letterSpacing: "0.14em" }}
          >
            Quick Sectors
          </div>
          <div className="grid grid-cols-2 gap-1">
            {[
              { key: "weddell", label: "Weddell / A23A" },
              { key: "ross",    label: "Ross Sea" },
              { key: "drake",   label: "Drake Passage" },
              { key: "overview",label: "All Antarctica" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onSelectSector(key as any)}
                className="rounded text-center transition-all"
                style={{
                  padding: "5px 8px",
                  fontSize: 10,
                  background: "rgba(255,255,255,0.02)",
                  color: "#8C8578",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#B8A58A";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,165,138,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#8C8578";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
