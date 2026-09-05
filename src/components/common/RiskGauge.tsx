"use client";

import React from "react";

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  subLabel?: string;
  showStatusText?: boolean;
}

export default function RiskGauge({
  score,
  size = 180,
  label = "NAVIGATION RISK INDEX",
  subLabel,
  showStatusText = true,
}: RiskGaugeProps) {
  const normalized = Math.min(100, Math.max(0, score));

  // Determine color and status
  let strokeColor = "#10B981"; // Low
  let statusText = "LOW HAZARD";
  let textColor = "text-emerald-400";

  if (normalized >= 75) {
    strokeColor = "#EF4444";
    statusText = "CRITICAL RISK";
    textColor = "text-red-400";
  } else if (normalized >= 55) {
    strokeColor = "#F97316";
    statusText = "MODERATE / ELEVATED";
    textColor = "text-orange-400";
  } else if (normalized >= 35) {
    strokeColor = "#F59E0B";
    statusText = "MODERATE RISK";
    textColor = "text-amber-400";
  }

  // Semi-circle SVG calculation
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = Math.PI * radius; // 180 degree semi-circle
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center">
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 10}
          viewBox={`0 0 ${size} ${size / 2 + 10}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${center}`}
            fill="none"
            stroke="#0f172a"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled Metric Arc */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${center}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Tick marks at 0, 25, 50, 75, 100 */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI * (1 - tick / 100);
            const x1 = center + (radius - 12) * Math.cos(angle);
            const y1 = center - (radius - 12) * Math.sin(angle);
            const x2 = center + (radius + 2) * Math.cos(angle);
            const y2 = center - (radius + 2) * Math.sin(angle);

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#475569"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
          <div className="flex items-baseline space-x-1 font-mono">
            <span className={`text-4xl font-black ${textColor}`}>
              {normalized}
            </span>
            <span className="text-slate-500 text-xs font-semibold">/ 100</span>
          </div>
          {showStatusText && (
            <span className={`text-[10px] font-mono tracking-wider font-bold ${textColor} uppercase mt-0.5`}>
              {statusText}
            </span>
          )}
        </div>
      </div>

      <div className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider mt-1 uppercase">
        {label}
      </div>
      {subLabel && <div className="text-[10px] font-mono text-slate-500 mt-0.5">{subLabel}</div>}
    </div>
  );
}
