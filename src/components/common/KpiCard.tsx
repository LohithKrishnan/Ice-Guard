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
  const schemeStyles = {
    cyan: "border-cyan-500/30 text-cyan-400 bg-cyan-950/10",
    emerald: "border-emerald-500/30 text-emerald-400 bg-emerald-950/10",
    amber: "border-amber-500/30 text-amber-400 bg-amber-950/10",
    rose: "border-red-500/30 text-red-400 bg-red-950/10",
    blue: "border-blue-500/30 text-blue-400 bg-blue-950/10",
  }[colorScheme];

  return (
    <div className="bg-polar-900/90 backdrop-blur-md border border-polar-750/90 rounded-lg p-3.5 shadow-panel-glow flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-slate-400">
        <span>{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-md border ${schemeStyles}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <div className="text-2xl lg:text-3xl font-mono font-black tracking-tight text-white flex items-baseline space-x-2">
          <span>{value}</span>
          {subValue && <span className="text-xs font-normal text-slate-400 font-mono">{subValue}</span>}
        </div>
      </div>

      {/* Trend indicator & footnote */}
      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-polar-800">
        {change && (
          <div className="flex items-center space-x-1">
            {trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />}
            {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
            {trend === "neutral" && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span
              className={
                trendSeverity === "warning"
                  ? "text-amber-400"
                  : trendSeverity === "negative"
                  ? "text-red-400"
                  : "text-emerald-400"
              }
            >
              {change}
            </span>
          </div>
        )}
        {footerNotice && <span className="text-slate-500 text-[10px] ml-auto">{footerNotice}</span>}
      </div>
    </div>
  );
}
