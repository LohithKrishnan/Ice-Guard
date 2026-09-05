"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/context/NavigationContext";
import { useSimulation } from "@/context/SimulationContext";
import { formatCoordinates, formatLat, formatLng } from "@/lib/utils";
import MapLayerControl from "./MapLayerControl";
import PolarRadarView from "./PolarRadarView";
import { MOCK_ROUTES } from "@/services/routeService";
import {
  Compass,
  Navigation,
  Ship,
  TriangleAlert,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Radio,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function AntarcticMap() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any>({});
  const layersGroupRef = useRef<any>({});

  const {
    layers,
    selectedIcebergId,
    setSelectedIcebergId,
    projectionMode,
  } = useNavigation();

  const { snapshot, currentStep, activeRouteId } = useSimulation();
  const [activeBergDetail, setActiveBergDetail] = useState<any>(null);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (projectionMode === "polar") return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    let isMounted = true;

    // Dynamically require Leaflet on client side
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Center around Antarctic Peninsula & Weddell Sea where A23A and primary shipping lanes are
      const map = L.map(mapContainerRef.current, {
        center: [-63.5, -48.0],
        zoom: 4,
        minZoom: 3,
        maxZoom: 9,
        zoomControl: false,
        attributionControl: true,
      });

      // OpenStreetMap Base Tiles (100% free, no API key required) with dark command-center tactical styling
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | ESA Copernicus SAR',
          subdomains: ["a", "b", "c"],
          maxZoom: 19,
          className: "map-tiles-dark",
        }
      ).addTo(map);

      // Coordinate reticle tracker
      map.on("mousemove", (e: any) => {
        setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [projectionMode]);

  // Sector quick view navigation
  const handleSectorJump = (sector: "weddell" | "ross" | "drake" | "overview") => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (sector === "weddell") {
      map.setView([-62.0, -48.0], 5);
    } else if (sector === "ross") {
      map.setView([-72.0, 175.0], 4);
    } else if (sector === "drake") {
      map.setView([-58.5, -60.0], 5);
    } else {
      map.setView([-68.0, 0.0], 3);
    }
  };

  // Sync Layers & Simulation Data into Leaflet
  useEffect(() => {
    if (projectionMode === "polar" || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous feature groups
      if (layersGroupRef.current.main) {
        map.removeLayer(layersGroupRef.current.main);
      }

      const mainGroup = L.featureGroup().addTo(map);
      layersGroupRef.current.main = mainGroup;

      // 1. Sea Ice Concentration Layer
      if (layers.seaIce) {
        // Weddell Heavy Pack
        L.circle([-71.5, -42.0], {
          radius: 380000,
          color: "#0369A1",
          fillColor: "#0284C7",
          fillOpacity: 0.28,
          weight: 1.5,
          dashArray: "4,4",
        })
          .bindTooltip("Weddell Heavy Pack Ice (92% Concentration | 2.3m)", {
            className: "bg-polar-900 text-cyan-300 font-mono text-xs border border-cyan-500/40",
          })
          .addTo(mainGroup);

        // Scotia Marginal Ice Zone
        L.circle([-59.5, -46.0], {
          radius: 260000,
          color: "#38BDF8",
          fillColor: "#38BDF8",
          fillOpacity: 0.16,
          weight: 1,
        })
          .bindTooltip("Scotia Sea Marginal Ice Zone (38% Concentration)", {
            className: "bg-polar-900 text-sky-300 font-mono text-xs border border-sky-500/40",
          })
          .addTo(mainGroup);

        // Ross Sea Broken Pack
        L.circle([-72.0, 175.0], {
          radius: 420000,
          color: "#0284C7",
          fillColor: "#0369A1",
          fillOpacity: 0.25,
          weight: 1,
        })
          .bindTooltip("Ross Sea Pack Ice (68% Concentration)", {
            className: "bg-polar-900 text-cyan-300 font-mono text-xs border border-cyan-500/40",
          })
          .addTo(mainGroup);
      }

      // 2. Risk Zones Layer
      if (layers.riskZones) {
        // A23A Fragment dispersion corridor
        L.circle([-60.85, -48.20], {
          radius: 120000,
          color: "#EF4444",
          fillColor: "#EF4444",
          fillOpacity: 0.2,
          weight: 1.5,
          dashArray: "6,6",
        })
          .bindTooltip("CRITICAL HAZARD ZONE: A23A Fragment Dispersion Field", {
            className: "bg-red-950 text-red-300 font-mono text-xs border border-red-500",
          })
          .addTo(mainGroup);

        // Katabatic Gale Zone
        L.circle([-63.20, -58.20], {
          radius: 90000,
          color: "#F59E0B",
          fillColor: "#F59E0B",
          fillOpacity: 0.18,
          weight: 1.5,
        })
          .bindTooltip("WARNING: Katabatic Wind & Spray Icing Zone (65 kt gusts)", {
            className: "bg-amber-950 text-amber-300 font-mono text-xs border border-amber-500",
          })
          .addTo(mainGroup);
      }

      // 3. Navigation Routes Layer
      const activeRoute = MOCK_ROUTES.find((r) => r.id === activeRouteId) || MOCK_ROUTES[0];
      const routeLatLngs: [number, number][] = activeRoute.waypoints.map((w) => [w.lat, w.lng]);

      // Draw other routes faded
      MOCK_ROUTES.filter((r) => r.id !== activeRouteId).forEach((r) => {
        const otherLatLngs: [number, number][] = r.waypoints.map((w) => [w.lat, w.lng]);
        L.polyline(otherLatLngs, {
          color: r.type === "fast" ? "#f87171" : "#34d399",
          weight: 2,
          opacity: 0.35,
          dashArray: "4,4",
        }).addTo(mainGroup);
      });

      // Active Recommended Route line
      L.polyline(routeLatLngs, {
        color: activeRoute.color,
        weight: 3.5,
        opacity: 0.9,
        dashArray: activeRoute.type === "balanced" ? "6,6" : undefined,
      })
        .bindTooltip(`${activeRoute.name} (${activeRoute.distanceNm} nm | Risk: ${activeRoute.riskScore}/100)`, {
          className: "bg-polar-900 text-cyan-300 font-mono text-xs border border-cyan-500",
        })
        .addTo(mainGroup);

      // Waypoint markers along active route
      activeRoute.waypoints.forEach((wp, idx) => {
        const wpIcon = L.divIcon({
          className: "custom-wp-icon",
          html: `<div class="w-3 h-3 rounded-full bg-cyan-400 border border-black shadow-[0_0_8px_#00F0FF] flex items-center justify-center text-[8px] font-bold font-mono text-black">${idx + 1}</div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        L.marker([wp.lat, wp.lng], { icon: wpIcon })
          .bindTooltip(`WP ${idx + 1}: ${wp.name || "Waypoint"}`, {
            className: "bg-polar-900 text-slate-200 font-mono text-xs",
          })
          .addTo(mainGroup);
      });

      // 4. Vessel Marker
      if (layers.vessels) {
        const v = snapshot.vessel;
        const vesselIcon = L.divIcon({
          className: "custom-vessel-icon",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full bg-cyan-500/20 animate-ping"></div>
              <div class="w-6 h-6 rounded-full bg-polar-900 border-2 border-cyan-400 flex items-center justify-center shadow-cyan-glow transform rotate-[${v.headingDeg}deg]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5">
                  <polygon points="12 2 19 21 12 17 5 21 12 2" />
                </svg>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([v.currentLat, v.currentLng], { icon: vesselIcon })
          .bindTooltip(`<b>${v.name}</b> (${v.iceClass})<br/>Speed: ${v.speedKnots} kt | Heading: ${v.headingDeg}°`, {
            className: "bg-polar-900 text-slate-100 font-mono text-xs border border-cyan-500/40",
          })
          .addTo(mainGroup);
      }

      // 5. Iceberg Markers & Trajectories
      if (layers.icebergs) {
        snapshot.icebergs.forEach((berg) => {
          const isSelected = selectedIcebergId === berg.id;
          const isCrit = berg.riskTier === "CRITICAL";

          const bergIcon = L.divIcon({
            className: "custom-berg-icon",
            html: `
              <div class="cursor-pointer group flex flex-col items-center">
                <div class="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-polar-950/90 border ${
                  isSelected
                    ? "border-cyan-400 shadow-[0_0_12px_#00F0FF] text-cyan-300 font-bold"
                    : isCrit
                    ? "border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                    : "border-sky-500/50 text-sky-200"
                } text-[10px] font-mono whitespace-nowrap">
                  <span>${berg.id}</span>
                  <span class="text-[8px] opacity-75">${berg.driftSpeedKnots}kt</span>
                </div>
                <div class="w-3 h-3 bg-gradient-to-b ${
                  isCrit ? "from-red-500 to-rose-700" : "from-cyan-400 to-blue-600"
                } border border-white transform rotate-45 mt-0.5 shadow-md"></div>
              </div>
            `,
            iconSize: [46, 32],
            iconAnchor: [23, 16],
          });

          const marker = L.marker([berg.latitude, berg.longitude], { icon: bergIcon })
            .on("click", () => {
              setSelectedIcebergId(berg.id);
              setActiveBergDetail(berg);
            })
            .addTo(mainGroup);

          // 6. Trajectories for selected iceberg
          if (layers.trajectories && (isSelected || berg.id === "A23A")) {
            // Historical path
            const histCoords: [number, number][] = berg.historicalTrail.map((h) => [h.lat, h.lng]);
            histCoords.push([berg.latitude, berg.longitude]);
            L.polyline(histCoords, {
              color: "#94a3b8",
              weight: 2,
              opacity: 0.6,
              dashArray: "3,4",
            }).addTo(mainGroup);

            // Predicted path (Current -> 24h -> 48h -> 72h -> 7d)
            const predCoords: [number, number][] = [
              [berg.latitude, berg.longitude],
              [berg.predictions["24h"].lat, berg.predictions["24h"].lng],
              [berg.predictions["48h"].lat, berg.predictions["48h"].lng],
              [berg.predictions["72h"].lat, berg.predictions["72h"].lng],
              [berg.predictions["7d"].lat, berg.predictions["7d"].lng],
            ];

            L.polyline(predCoords, {
              color: isCrit ? "#ef4444" : "#00F0FF",
              weight: 3,
              opacity: 0.85,
              dashArray: "5,5",
            }).addTo(mainGroup);

            // Uncertainty cones (Circles at 24h, 48h, 72h)
            (["24h", "48h", "72h"] as const).forEach((horizon) => {
              const pt = berg.predictions[horizon];
              L.circle([pt.lat, pt.lng], {
                radius: pt.uncertaintyRadiusKm * 1000,
                color: isCrit ? "#ef4444" : "#00F0FF",
                fillColor: isCrit ? "#ef4444" : "#00F0FF",
                fillOpacity: 0.12,
                weight: 1,
                dashArray: "3,3",
              })
                .bindTooltip(
                  `<b>${berg.id} ${horizon} Forecast</b><br/>Speed: ${pt.speedKnots} kt @ ${pt.headingDeg}°<br/>Uncertainty Cone: ±${pt.uncertaintyRadiusKm} km`,
                  { className: "bg-polar-900 text-cyan-300 font-mono text-xs border border-cyan-500/40" }
                )
                .addTo(mainGroup);
            });
          }
        });
      }
    });
  }, [layers, selectedIcebergId, snapshot, currentStep, activeRouteId, projectionMode, setSelectedIcebergId]);

  return (
    <div className="relative w-full h-full min-h-[560px] flex flex-col overflow-hidden select-none" style={{ background: "#0D0D0D" }}>
      {/* Switch between Leaflet & Polar Radar — isolated stacking context keeps Leaflet z-indices contained */}
      {projectionMode === "polar" ? (
        <PolarRadarView />
      ) : (
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ isolation: "isolate", zIndex: 0 }} />
      )}

      {/* Floating Tactical Layer Control HUD */}
      <div className="absolute top-4 right-4" style={{ zIndex: 1000 }}>
        <MapLayerControl onSelectSector={handleSectorJump} />
      </div>

      {/* Floating Coordinates & Telemetry HUD at Bottom-Left */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2" style={{ zIndex: 1000 }}>
        <div
          className="flex items-center space-x-3 rounded text-xs font-mono"
          style={{
            background: "rgba(13,13,13,0.94)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            padding: "6px 12px",
            color: "#8C8578",
          }}
        >
          <div className="flex items-center space-x-1.5" style={{ color: "#B8A58A" }}>
            <Crosshair className="w-3 h-3 animate-spin-slow" />
            <span className="font-semibold tracking-widest" style={{ fontSize: 9, letterSpacing: "0.1em" }}>RETICLE</span>
          </div>
          <span style={{ color: "#F2F0EB" }}>
            {mouseCoords
              ? `${formatLat(mouseCoords.lat)} ${formatLng(mouseCoords.lng)}`
              : "-63°24'S 048°15'W"}
          </span>
          <span style={{ color: "#2A2A2A" }}>|</span>
          <span style={{ color: "#4A4540", fontSize: 10 }}>DEPTH: 3,420m</span>
        </div>
      </div>

      {/* Selected Iceberg Popup Card Modal / Drawer */}
      {activeBergDetail && (
        <div
          className="absolute bottom-6 right-6 rounded-lg text-xs animate-in slide-in-from-bottom-3"
          style={{
            zIndex: 1000,
            width: 320,
            background: "rgba(17,17,17,0.97)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
            padding: 16,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-black text-white">
                  {activeBergDetail.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-red-950 text-red-300 border border-red-500/50">
                  {activeBergDetail.riskTier}
                </span>
              </div>
              <div className="text-[10px] font-mono text-cyan-400">
                {activeBergDetail.code}
              </div>
            </div>
            <button
              onClick={() => setActiveBergDetail(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          {/* Key Metric Rows */}
          <div className="grid grid-cols-2 gap-2 my-3 text-[11px] font-mono">
            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <span className="text-slate-400 text-[10px] block">CURRENT POSITION</span>
              <span className="text-cyan-300 font-bold">
                {formatCoordinates(activeBergDetail.latitude, activeBergDetail.longitude)}
              </span>
            </div>

            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <span className="text-slate-400 text-[10px] block">DIMENSIONS & SIZE</span>
              <span className="text-white font-bold">
                {activeBergDetail.sizeKm.length} km × {activeBergDetail.sizeKm.width} km
              </span>
            </div>

            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <span className="text-slate-400 text-[10px] block">DRIFT SPEED & HEADING</span>
              <span className="text-white font-bold">
                {activeBergDetail.driftSpeedKnots} knots @ {activeBergDetail.driftDirectionDeg}°
              </span>
            </div>

            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <span className="text-slate-400 text-[10px] block">DETECTION CONFIDENCE</span>
              <span className="text-emerald-400 font-bold">
                {activeBergDetail.detectionConfidence}% ({activeBergDetail.sensorSource})
              </span>
            </div>
          </div>

          {/* Prediction Highlights */}
          <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/30 mb-3 text-[11px] font-mono">
            <div className="text-cyan-300 font-semibold mb-1 flex items-center justify-between">
              <span>72-HOUR AI TRAJECTORY</span>
              <span className="text-emerald-400 font-bold">91% Conf</span>
            </div>
            <div className="text-slate-300 flex items-center justify-between text-[10px]">
              <span>Predicted Speed: 0.38 kt</span>
              <span>Predicted Direction: 132°</span>
              <span>Cone: ±21.5 km</span>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center space-x-2 pt-2 border-t border-polar-750">
            <Link
              href={`/icebergs/${activeBergDetail.id}`}
              className="flex-1 py-1.5 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-semibold text-center transition-colors shadow-cyan-glow text-[11px]"
            >
              VIEW DETAILS
            </Link>

            <button
              onClick={() => {
                router.push(`/predictions`);
              }}
              className="py-1.5 px-2.5 rounded bg-polar-900 hover:bg-polar-800 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] transition-colors"
            >
              PREDICT TRAJECTORY
            </button>

            <button
              onClick={() => {
                router.push(`/risk`);
              }}
              className="py-1.5 px-2 rounded bg-polar-900 hover:bg-polar-800 border border-polar-750 text-slate-300 font-mono text-[11px] transition-colors"
            >
              ADD TO RISK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
