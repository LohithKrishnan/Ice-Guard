"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  trendSeverity?: "positive" | "negative" | "warning";
  icon?: LucideIcon;
  colorScheme?: "cyan" | "emerald" | "amber" | "rose" | "blue";
  footerNotice?: string;
}

export default function KpiCard({
  label,
  value,
  subValue,
  change,
  trend,
  trendSeverity = "positive",
  icon: Icon,
  colorScheme = "cyan",
  footerNotice,
}: KpiCardProps) {
  // Map legacy color schemes to muted equivalents
  const trendColor =
    trendSeverity === "warning"
      ? "#9C7B2A"
      : trendSeverity === "negative"
      ? "#8B2A2A"
      : "#4A7C59";

  return (
    <div
      className="flex flex-col justify-between relative overflow-hidden transition-all"
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        padding: "14px 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
    >
      {/* Label + Icon */}
      <div className="flex items-center justify-between">
        <span
          className="uppercase tracking-widest font-medium"
          style={{ color: "#4A4540", fontSize: 9, letterSpacing: "0.14em" }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="flex items-center justify-center rounded"
            style={{
              width: 26,
              height: 26,
              background: "rgba(184,165,138,0.07)",
              border: "1px solid rgba(184,165,138,0.12)",
            }}
          >
            <Icon className="w-3 h-3" style={{ color: "#B8A58A" }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="my-3 flex items-baseline gap-1.5">
        <span
          className="font-semibold tracking-tight"
          style={{ color: "#F2F0EB", fontSize: 28, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </span>
        {subValue && (
          <span style={{ color: "#4A4540", fontSize: 11 }}>{subValue}</span>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 10 }}
      >
        {change && (
          <div className="flex items-center gap-1">
            {trend === "up" && <ArrowUpRight className="w-3 h-3" style={{ color: trendColor }} />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" style={{ color: trendColor }} />}
            {trend === "neutral" && <Minus className="w-3 h-3" style={{ color: "#4A4540" }} />}
            <span style={{ color: trendColor }}>{change}</span>
          </div>
        )}
        {footerNotice && (
          <span className="ml-auto font-mono" style={{ color: "#4A4540", fontSize: 9 }}>
            {footerNotice}
          </span>
        )}
      </div>
    </div>
  );
}
