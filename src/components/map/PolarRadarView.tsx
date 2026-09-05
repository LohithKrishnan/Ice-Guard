"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Ship, TriangleAlert, Info, Maximize2, ShieldAlert } from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { useNavigation } from "@/context/NavigationContext";
import { formatCoordinates } from "@/lib/utils";

export default function PolarRadarView() {
  const { snapshot } = useSimulation();
  const { setSelectedIcebergId, selectedIcebergId } = useNavigation();
  const [hoveredTarget, setHoveredTarget] = useState<any>(null);

  // Convert (lat, lng) to polar radar SVG coordinates (center 400, 400; radius 350 for 60°S)
  // lat goes from -90 (center r=0) to -55 (outer r=380)
  const polarToSvg = (lat: number, lng: number) => {
    const center = 400;
    const maxRadius = 350;
    // Map -90° to 0 radius, -55° to maxRadius
    const r = ((Math.abs(lat) - 90) / (55 - 90)) * maxRadius;
    // Convert longitude to radians (with 0° up, 90°E right, 180° down, 90°W left)
    const thetaRad = ((lng - 90) * Math.PI) / 180;
    const x = center + r * Math.cos(thetaRad);
    const y = center + r * Math.sin(thetaRad);
    return { x, y, r };
  };

  const center = 400;

  return (
    <div className="relative w-full h-full bg-polar-950 flex items-center justify-center overflow-hidden border border-polar-800 select-none">
      {/* Background Reticle Grid & Radar Sweep */}
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full max-h-[750px] max-w-[750px] aspect-square"
      >
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0369a1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.25)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
          </linearGradient>
        </defs>

        {/* Glow fill */}
        <circle cx={center} cy={center} r={350} fill="url(#radarGlow)" />

        {/* Concentric Latitude Rings */}
        {[
          { lat: -85, r: 50, label: "85°S" },
          { lat: -80, r: 100, label: "80°S" },
          { lat: -75, r: 150, label: "75°S" },
          { lat: -70, r: 200, label: "70°S (POLAR CIRCLE)" },
          { lat: -65, r: 260, label: "65°S" },
          { lat: -60, r: 350, label: "60°S (CONVERGENCE ZONE)" },
        ].map(({ lat, r, label }) => (
          <g key={lat}>
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#0e7490"
              strokeWidth="0.8"
              strokeDasharray={lat === -70 || lat === -60 ? "4,4" : "2,2"}
              strokeOpacity="0.4"
            />
            <text
              x={center + 5}
              y={center - r + 12}
              fill="#38bdf8"
              fontSize="9"
              fontFamily="monospace"
              opacity="0.6"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Longitude Crosshairs / Meridians */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = center + 355 * Math.cos(rad);
          const y2 = center + 355 * Math.sin(rad);
          return (
            <line
              key={deg}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#0e7490"
              strokeWidth="0.6"
              strokeOpacity="0.25"
            />
          );
        })}

        {/* Cardinal Meridian Labels */}
        <text x={center} y={center - 360} fill="#7dd3fc" fontSize="11" fontFamily="monospace" textAnchor="middle">
          0° PRIME MERIDIAN (ATLANTIC)
        </text>
        <text x={center + 365} y={center + 4} fill="#7dd3fc" fontSize="11" fontFamily="monospace">
          90°E (INDIAN OCEAN)
        </text>
        <text x={center} y={center + 375} fill="#7dd3fc" fontSize="11" fontFamily="monospace" textAnchor="middle">
          180° ANTIMERIDIAN (PACIFIC)
        </text>
        <text x={center - 365} y={center + 4} fill="#7dd3fc" fontSize="11" fontFamily="monospace" textAnchor="end">
          90°W (BELLINGSHAUSEN)
        </text>

        {/* Stylized Antarctic Coastline & Major Ice Shelves Outlines */}
        <path
          d="M 330,360 
             Q 310,310 350,260 
             Q 370,220 420,240 
             Q 480,260 520,310 
             Q 570,380 540,460 
             Q 510,530 430,550 
             Q 380,560 330,510 
             Q 280,450 300,390 Z"
          fill="#0c4a6e"
          fillOpacity="0.25"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />

        {/* Weddell Sea Ice Shelf / Basin */}
        <path
          d="M 350,260 Q 380,290 350,330 Q 320,320 350,260 Z"
          fill="#0284c7"
          fillOpacity="0.3"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />
        <text x="345" y="300" fill="#bae6fd" fontSize="9" fontFamily="monospace" opacity="0.7">
          WEDDELL GYRE
        </text>

        {/* Ross Sea Basin */}
        <path
          d="M 430,520 Q 450,470 410,470 Q 390,500 430,520 Z"
          fill="#0284c7"
          fillOpacity="0.3"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />
        <text x="420" y="500" fill="#bae6fd" fontSize="9" fontFamily="monospace" opacity="0.7">
          ROSS ICE SHELF
        </text>

        {/* Rotating Radar Sweep Beam */}
        <g className="origin-center animate-radar" style={{ transformOrigin: "400px 400px" }}>
          <path
            d="M 400,400 L 750,400 A 350,350 0 0,0 710,210 Z"
            fill="url(#sweepGradient)"
          />
          <line x1="400" y1="400" x2="750" y2="400" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.8" />
        </g>

        {/* Center: South Pole marker */}
        <circle cx={center} cy={center} r={3} fill="#00F0FF" />
        <circle cx={center} cy={center} r={8} fill="none" stroke="#00F0FF" strokeWidth="0.8" strokeOpacity="0.6" />
        <text x={center + 10} y={center - 8} fill="#00F0FF" fontSize="10" fontFamily="monospace" fontWeight="bold">
          SOUTH POLE 90°S
        </text>

        {/* Plotted Icebergs */}
        {snapshot.icebergs.map((berg) => {
          const pt = polarToSvg(berg.latitude, berg.longitude);
          const isSelected = selectedIcebergId === berg.id;
          const isCrit = berg.riskTier === "CRITICAL";

          // Calculate 72h predicted endpoint
          const pred72 = polarToSvg(berg.predictions["72h"].lat, berg.predictions["72h"].lng);

          return (
            <g
              key={berg.id}
              className="cursor-pointer group"
              onClick={() => setSelectedIcebergId(berg.id)}
              onMouseEnter={() => setHoveredTarget({ type: "iceberg", data: berg })}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              {/* Uncertainty cone */}
              <line
                x1={pt.x}
                y1={pt.y}
                x2={pred72.x}
                y2={pred72.y}
                stroke={isCrit ? "#ef4444" : "#00F0FF"}
                strokeWidth="1.5"
                strokeDasharray="3,3"
                strokeOpacity="0.8"
              />
              <circle
                cx={pred72.x}
                cy={pred72.y}
                r={berg.predictions["72h"].uncertaintyRadiusKm * 0.4}
                fill={isCrit ? "#ef4444" : "#00F0FF"}
                fillOpacity="0.15"
                stroke={isCrit ? "#ef4444" : "#00F0FF"}
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />

              {/* Iceberg Marker Symbol (Rotated diamond) */}
              <polygon
                points={`${pt.x},${pt.y - 7} ${pt.x + 6},${pt.y} ${pt.x},${pt.y + 7} ${pt.x - 6},${pt.y}`}
                fill={isSelected ? "#00F0FF" : isCrit ? "#ef4444" : "#38bdf8"}
                stroke="#ffffff"
                strokeWidth="1"
                className={isCrit ? "animate-pulse" : ""}
              />

              {/* Berg Label */}
              <text
                x={pt.x + 8}
                y={pt.y + 3}
                fill={isSelected ? "#00F0FF" : "#ffffff"}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {berg.id}
              </text>
            </g>
          );
        })}

        {/* Plotted Vessel */}
        {(() => {
          const vPt = polarToSvg(snapshot.vessel.currentLat, snapshot.vessel.currentLng);
          return (
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredTarget({ type: "vessel", data: snapshot.vessel })}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              <circle cx={vPt.x} cy={vPt.y} r={12} fill="#3b82f6" fillOpacity="0.25" className="animate-ping" />
              <polygon
                points={`${vPt.x},${vPt.y - 9} ${vPt.x + 5},${vPt.y + 7} ${vPt.x},${vPt.y + 4} ${vPt.x - 5},${vPt.y + 7}`}
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1.2"
                transform={`rotate(${snapshot.vessel.headingDeg}, ${vPt.x}, ${vPt.y})`}
              />
              <text
                x={vPt.x + 9}
                y={vPt.y - 3}
                fill="#7dd3fc"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                POLARIS V
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Floating Target Inspector HUD */}
      {hoveredTarget && (
        <div className="absolute top-4 left-4 bg-polar-950/95 backdrop-blur-md border border-cyan-500/40 rounded-lg p-3 text-xs shadow-2xl max-w-xs animate-in fade-in">
          {hoveredTarget.type === "iceberg" ? (
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-polar-800">
                <span className="font-mono font-bold text-white flex items-center gap-1.5">
                  <TriangleAlert className="w-3.5 h-3.5 text-cyan-400" />
                  {hoveredTarget.data.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-red-950 text-red-300 border border-red-500/40 font-semibold">
                  {hoveredTarget.data.riskTier}
                </span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
                <div>POSITION: {formatCoordinates(hoveredTarget.data.latitude, hoveredTarget.data.longitude)}</div>
                <div>SIZE: {hoveredTarget.data.sizeKm.length} km × {hoveredTarget.data.sizeKm.width} km</div>
                <div>DRIFT: {hoveredTarget.data.driftSpeedKnots} kt @ {hoveredTarget.data.driftDirectionDeg}°</div>
                <div>CONFIDENCE: {hoveredTarget.data.detectionConfidence}%</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-polar-800">
                <span className="font-mono font-bold text-white flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-blue-400" />
                  {hoveredTarget.data.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-blue-950 text-blue-300 border border-blue-500/40 font-semibold">
                  PC3
                </span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
                <div>POSITION: {formatCoordinates(hoveredTarget.data.currentLat, hoveredTarget.data.currentLng)}</div>
                <div>SPEED: {hoveredTarget.data.speedKnots} kt @ {hoveredTarget.data.headingDeg}°</div>
                <div>DESTINATION: {hoveredTarget.data.destination}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projection Badge & Legend */}
      <div className="absolute bottom-4 left-4 bg-polar-950/90 backdrop-blur-md border border-polar-750 px-3 py-2 rounded text-xs space-y-1">
        <div className="font-mono text-[11px] text-cyan-300 font-bold flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          EPSG:3031 SOUTH POLAR STEREOGRAPHIC
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          CENTER: 90°00&apos;S | TRUE TO AZIMUTH | EQUIDISTANT SCALING
        </div>
      </div>
    </div>
  );
}
