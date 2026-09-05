"use client";

import React from "react";

interface RiskGaugeProps {
  score: number;
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

  let strokeColor = "#4A7C59"; // low — muted green
  let statusText = "LOW HAZARD";
  let textColor = "#4A7C59";

  if (normalized >= 75) {
    strokeColor = "#8B2A2A";
    statusText = "CRITICAL RISK";
    textColor = "#C87878";
  } else if (normalized >= 55) {
    strokeColor = "#9B4A2A";
    statusText = "ELEVATED";
    textColor = "#C89070";
  } else if (normalized >= 35) {
    strokeColor = "#9C7B2A";
    statusText = "MODERATE";
    textColor = "#C8A850";
  }

  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ padding: 12 }}>
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 10}
          viewBox={`0 0 ${size} ${size / 2 + 10}`}
          className="overflow-visible"
        >
          {/* Background track */}
          <path
            d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${center}`}
            fill="none"
            stroke="#1A1A1A"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
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
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = Math.PI * (1 - tick / 100);
            const x1 = center + (radius - 8) * Math.cos(angle);
            const y1 = center - (radius - 8) * Math.sin(angle);
            const x2 = center + (radius + 2) * Math.cos(angle);
            const y2 = center - (radius + 2) * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Score readout */}
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
          <div className="flex items-baseline gap-1" style={{ fontVariantNumeric: "tabular-nums" }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: textColor, lineHeight: 1 }}>
              {normalized}
            </span>
            <span style={{ color: "#4A4540", fontSize: 11 }}>/ 100</span>
          </div>
          {showStatusText && (
            <span
              className="uppercase tracking-widest font-semibold mt-1"
              style={{ color: textColor, fontSize: 9, letterSpacing: "0.15em" }}
            >
              {statusText}
            </span>
          )}
        </div>
      </div>

      <div
        className="uppercase tracking-widest font-medium mt-1"
        style={{ color: "#4A4540", fontSize: 9, letterSpacing: "0.14em" }}
      >
        {label}
      </div>
      {subLabel && (
        <div className="mt-0.5" style={{ color: "#4A4540", fontSize: 9 }}>
          {subLabel}
        </div>
      )}
    </div>
  );
}
