"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Radio,
  Cpu,
  Bell,
  Ship,
  ShieldCheck,
  ChevronDown,
  X,
  ExternalLink,
  Sliders,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { useSimulation } from "@/context/SimulationContext";
import { getAlerts, MOCK_ALERTS } from "@/services/alertService";
import { checkBackendHealth } from "@/services/apiClient";
import { MaritimeAlert } from "@/services/types";

export default function TopBar() {
  const [utcTime, setUtcTime] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [liveAlerts, setLiveAlerts] = useState<MaritimeAlert[]>(MOCK_ALERTS);
  const { currentStep, isPlaying, togglePlay, reset, setStep } = useSimulation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace("T", " ").replace(/\..+/, "") + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Backend health and live alerts
    checkBackendHealth().then((res) => setBackendOnline(res.online));
    getAlerts().then((data) => {
      if (data && data.length > 0) setLiveAlerts(data);
    });

    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = liveAlerts.filter((a) => !a.acknowledged);

  return (
    <header className="h-14 border-b border-polar-750/80 bg-polar-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 sticky top-0 text-xs">
      {/* Left items: Clock & Telemetry Status */}
      <div className="flex items-center space-x-4">
        {/* UTC Live Clock */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-polar-900/90 border border-polar-750 text-cyan-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="tracking-wide font-medium">{utcTime || "SYNCING UTC..."}</span>
        </div>

        {/* Data Freshness Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded bg-polar-900/60 border border-polar-800 text-slate-300">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">FEED:</span>
          <span className="font-mono text-slate-200">S1-SAR / T-8m</span>
        </div>

        {/* Vessel Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-polar-900/80 border border-cyan-500/20 text-slate-200">
          <Ship className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">R/V POLARIS V</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono">
            PC3
          </span>
          <span className="font-mono text-slate-400 hidden md:inline">11.4 kt @ 142°</span>
        </div>
      </div>

      {/* Center: Simulation Controller HUD */}
      <div className="flex items-center space-x-2 bg-polar-900/90 border border-polar-700/60 rounded-md px-2 py-1">
        <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span className="hidden xl:inline">SIM TIMELINE</span>
        </span>
        <div className="flex items-center bg-polar-950 rounded p-0.5 border border-polar-800">
          {(["T+0", "T+24h", "T+48h", "T+72h", "T+7d"] as const).map((step) => (
            <button
              key={step}
              onClick={() => setStep(step)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-all ${
                currentStep === step
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {step}
            </button>
          ))}
        </div>
        <button
          onClick={togglePlay}
          title={isPlaying ? "Pause Simulation" : "Play Simulation"}
          className={`p-1 rounded transition-colors ${
            isPlaying
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "bg-polar-800 text-slate-300 hover:text-white"
          }`}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
        </button>
        <button
          onClick={reset}
          title="Reset Simulation"
          className="p-1 rounded bg-polar-800 text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Right items: AI Status, Notifications & User */}
      <div className="flex items-center space-x-3">
        {/* AI Engine Status */}
        <div className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded ${
          backendOnline
            ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"
            : "bg-amber-950/40 border border-amber-500/40 text-amber-300"
        }`}>
          <Cpu className={`w-3.5 h-3.5 ${backendOnline ? "text-emerald-400" : "text-amber-400"}`} />
          <span className="text-[11px] font-mono font-medium">
            {backendOnline ? "FASTAPI LIVE: CONNECTED" : "SIMULATION: LOCAL REPO"}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-md bg-polar-900 border border-polar-750 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
            title="System Alerts & Warnings"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center border border-polar-950">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-polar-900 border border-polar-700 rounded-lg shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-polar-750">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">Active Maritime Alerts</span>
                  <span className="px-1.5 py-0.2 bg-red-950 text-red-300 text-[10px] rounded border border-red-500/40 font-mono">
                    {unreadAlerts.length} Critical
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-polar-800 max-h-72 overflow-y-auto mt-2 space-y-2">
                {unreadAlerts.map((alert) => (
                  <div key={alert.id} className="pt-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-semibold">
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {alert.timestamp.slice(11, 16)} UTC
                      </span>
                    </div>
                    <p className="font-medium text-slate-200 mt-1">{alert.title}</p>
                    <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-polar-750 flex items-center justify-between text-[11px]">
                <Link
                  href="/alerts"
                  onClick={() => setShowNotifications(false)}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Alert Command Center
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User / Station Indicator */}
        <Link
          href="/settings"
          className="flex items-center space-x-2 px-2.5 py-1 rounded bg-polar-900 border border-polar-800 hover:border-polar-700 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
            IG
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[11px] font-semibold text-slate-200 leading-tight">COMMANDER</div>
            <div className="text-[9px] text-slate-400 font-mono">STATION TROLL</div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
        </Link>
      </div>
    </header>
  );
}
