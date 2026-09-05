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
  X,
  ExternalLink,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
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
      setUtcTime(now.toISOString().replace("T", " ").replace(/\..+/, "") + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    checkBackendHealth().then((res) => setBackendOnline(res.online));
    getAlerts().then((data) => { if (data && data.length > 0) setLiveAlerts(data); });
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = liveAlerts.filter((a) => !a.acknowledged);

  const chipStyle: React.CSSProperties = {
    background: "#161616",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 6,
    padding: "4px 10px",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <header
      className="flex items-center justify-between px-5 z-30 sticky top-0"
      style={{
        height: 52,
        background: "rgba(13,13,13,0.96)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        fontSize: 12,
      }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div style={{ ...chipStyle, color: "#F2F0EB" }}>
          <Clock className="w-3 h-3 animate-pulse-bronze" style={{ color: "#B8A58A" }} />
          <span className="font-mono tracking-wide" style={{ fontSize: 11 }}>
            {utcTime || "SYNCING…"}
          </span>
        </div>

        {/* Vessel */}
        <div className="hidden sm:flex items-center gap-2" style={chipStyle}>
          <Ship className="w-3 h-3" style={{ color: "#8C8578" }} />
          <span className="font-medium" style={{ color: "#F2F0EB" }}>R/V POLARIS V</span>
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: "rgba(184,165,138,0.1)", color: "#B8A58A", border: "1px solid rgba(184,165,138,0.2)" }}
          >
            PC3
          </span>
          <span className="hidden md:inline font-mono" style={{ color: "#4A4540", fontSize: 10 }}>
            11.4 kt @ 142°
          </span>
        </div>

        {/* Feed */}
        <div className="hidden lg:flex items-center gap-2" style={{ ...chipStyle, color: "#8C8578" }}>
          <Radio className="w-3 h-3 animate-pulse" style={{ color: "#4A7C59" }} />
          <span style={{ fontSize: 10 }}>S1-SAR / T-8m</span>
        </div>
      </div>

      {/* CENTER — Simulation Timeline */}
      <div
        className="flex items-center gap-2"
        style={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 6,
          padding: "4px 8px",
        }}
      >
        <Sliders className="w-3 h-3 hidden xl:block" style={{ color: "#4A4540" }} />
        <span className="text-[9px] tracking-widest uppercase hidden xl:block" style={{ color: "#4A4540" }}>
          Timeline
        </span>
        <div
          className="flex items-center rounded overflow-hidden"
          style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {(["T+0", "T+24h", "T+48h", "T+72h", "T+7d"] as const).map((step) => (
            <button
              key={step}
              onClick={() => setStep(step)}
              className="px-2 py-0.5 text-[10px] font-mono transition-all"
              style={
                currentStep === step
                  ? { background: "rgba(184,165,138,0.12)", color: "#B8A58A", borderRight: "1px solid rgba(184,165,138,0.15)" }
                  : { color: "#4A4540" }
              }
            >
              {step}
            </button>
          ))}
        </div>
        <button
          onClick={togglePlay}
          className="p-1 rounded transition-all"
          style={
            isPlaying
              ? { background: "rgba(184,165,138,0.12)", color: "#B8A58A" }
              : { color: "#4A4540" }
          }
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
        </button>
        <button onClick={reset} className="p-1 rounded" style={{ color: "#4A4540" }}>
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* Backend status */}
        <div
          className="hidden xl:flex items-center gap-2"
          style={{
            ...chipStyle,
            color: backendOnline ? "#4A7C59" : "#9C7B2A",
          }}
        >
          <Cpu className="w-3 h-3" />
          <span className="text-[10px] font-mono">{backendOnline ? "API LIVE" : "LOCAL SIM"}</span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: backendOnline ? "#4A7C59" : "#9C7B2A", animation: backendOnline ? "pulse 2s infinite" : "none" }}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded transition-colors"
            style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", color: "#8C8578" }}
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadAlerts.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white font-bold text-[9px] flex items-center justify-center"
                style={{ background: "#8B2A2A", border: "2px solid #0D0D0D" }}
              >
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
              style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.08)", padding: 16 }}
            >
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" style={{ color: "#B8A58A" }} />
                  <span className="font-semibold text-xs" style={{ color: "#F2F0EB" }}>Maritime Alerts</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "rgba(139,42,42,0.2)", color: "#C87878", border: "1px solid rgba(139,42,42,0.3)" }}
                  >
                    {unreadAlerts.length} critical
                  </span>
                </div>
                <button onClick={() => setShowNotifications(false)} style={{ color: "#4A4540" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                {unreadAlerts.map((alert) => (
                  <div key={alert.id} className="text-xs" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 10 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider"
                        style={{ background: "rgba(139,42,42,0.15)", color: "#C87878", border: "1px solid rgba(139,42,42,0.25)" }}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-mono" style={{ color: "#4A4540", fontSize: 10 }}>
                        {alert.timestamp.slice(11, 16)} UTC
                      </span>
                    </div>
                    <p className="font-medium" style={{ color: "#F2F0EB" }}>{alert.title}</p>
                    <p className="mt-0.5 line-clamp-2" style={{ color: "#8C8578", fontSize: 11 }}>{alert.message}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-1 flex items-center justify-between text-[11px]" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <Link
                  href="/alerts"
                  onClick={() => setShowNotifications(false)}
                  className="flex items-center gap-1 font-medium hover:opacity-80 transition-opacity"
                  style={{ color: "#B8A58A" }}
                >
                  View all alerts <ExternalLink className="w-3 h-3" />
                </Link>
                <button onClick={() => setShowNotifications(false)} style={{ color: "#4A4540" }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded transition-colors"
          style={{ ...chipStyle, color: "#8C8578" }}
        >
          <div
            className="w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] flex-shrink-0"
            style={{ background: "rgba(184,165,138,0.15)", color: "#B8A58A", border: "1px solid rgba(184,165,138,0.2)" }}
          >
            IG
          </div>
          <div className="hidden md:block text-left">
            <div className="text-[10px] font-semibold" style={{ color: "#F2F0EB" }}>COMMANDER</div>
            <div className="text-[9px] font-mono" style={{ color: "#4A4540" }}>TROLL STN</div>
          </div>
          <ChevronDown className="w-3 h-3 hidden md:block" style={{ color: "#4A4540" }} />
        </Link>
      </div>
    </header>
  );
}
