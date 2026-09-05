"use client";

import React, { createContext, useContext, useState } from "react";

export interface MapLayerState {
  seaIce: boolean;
  icebergs: boolean;
  trajectories: boolean;
  vessels: boolean;
  riskZones: boolean;
  weather: boolean;
  currents: boolean;
  satellite: boolean;
}

interface NavigationContextType {
  layers: MapLayerState;
  toggleLayer: (layer: keyof MapLayerState) => void;
  selectedIcebergId: string | null;
  setSelectedIcebergId: (id: string | null) => void;
  projectionMode: "mercator" | "polar";
  setProjectionMode: (mode: "mercator" | "polar") => void;
  highlightedZoneId: string | null;
  setHighlightedZoneId: (id: string | null) => void;
}

const DEFAULT_LAYERS: MapLayerState = {
  seaIce: true,
  icebergs: true,
  trajectories: true,
  vessels: true,
  riskZones: true,
  weather: false,
  currents: true,
  satellite: false,
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [layers, setLayers] = useState<MapLayerState>(DEFAULT_LAYERS);
  const [selectedIcebergId, setSelectedIcebergId] = useState<string | null>("A23A");
  const [projectionMode, setProjectionMode] = useState<"mercator" | "polar">("mercator");
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);

  const toggleLayer = (layer: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <NavigationContext.Provider
      value={{
        layers,
        toggleLayer,
        selectedIcebergId,
        setSelectedIcebergId,
        projectionMode,
        setProjectionMode,
        highlightedZoneId,
        setHighlightedZoneId,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
