"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRing,
  AlertTriangle,
  Info,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MapPin,
  RefreshCw,
  Filter,
  Check,
  Search,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import { getAlerts, acknowledgeAlert } from "@/services/alertService";
import { MaritimeAlert } from "@/services/types";
import { useNavigation } from "@/context/NavigationContext";
import { formatCoordinates } from "@/lib/utils";

export default function AlertsPage() {
  const router = useRouter();
  const { setSelectedIcebergId } = useNavigation();

  const [alerts, setAlerts] = useState<MaritimeAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function load() {
      const data = await getAlerts();
      setAlerts(data);
    }
    load();
  }, []);

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleViewOnMap = (alert: MaritimeAlert) => {
    if (alert.relatedIcebergId) {
      setSelectedIcebergId(alert.relatedIcebergId);
    }
    router.push("/");
  };

  const filtered = alerts.filter((a) => {
    const matchCat = activeFilter === "ALL" || a.severity === activeFilter;
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.source.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const counts = {
    CRITICAL: alerts.filter((a) => a.severity === "CRITICAL" && !a.acknowledged).length,
    WARNING: alerts.filter((a) => a.severity === "WARNING" && !a.acknowledged).length,
    ADVISORY: alerts.filter((a) => a.severity === "ADVISORY" && !a.acknowledged).length,
    INFORMATION: alerts.filter((a) => a.severity === "INFORMATION" && !a.acknowledged).length,
  };

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-red-400 animate-pulse" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              MARITIME SAFETY ALERTS & OPERATIONAL DISPATCH
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time hazard warnings from automated hydrodynamic models and AMPS weather forecasting.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FASTAPI LIVE (/api/alerts)
          </span>
          <button
            onClick={async () => {
              const data = await getAlerts(activeFilter);
              setAlerts(data);
            }}
            className="px-3 py-1.5 rounded bg-polar-900 hover:bg-polar-800 border border-polar-750 text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH</span>
          </button>
          <button
            onClick={() => {
              alerts.forEach((a) => handleAcknowledge(a.id));
            }}
            className="px-3 py-1.5 rounded bg-polar-900 hover:bg-polar-800 border border-polar-750 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>ACKNOWLEDGE ALL</span>
          </button>
        </div>
      </div>

      {/* Severity Filter Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["CRITICAL", "WARNING", "ADVISORY", "INFORMATION"] as const).map((sev) => {
          const isActive = activeFilter === sev;
          const count = counts[sev];

          const styles = {
            CRITICAL: "border-red-500/50 text-red-400 bg-red-950/20",
            WARNING: "border-amber-500/50 text-amber-400 bg-amber-950/20",
            ADVISORY: "border-sky-500/50 text-sky-400 bg-sky-950/20",
            INFORMATION: "border-emerald-500/50 text-emerald-400 bg-emerald-950/20",
          }[sev];

          return (
            <div
              key={sev}
              onClick={() => setActiveFilter(activeFilter === sev ? "ALL" : sev)}
              className={`p-3 rounded-lg border transition-all cursor-pointer font-mono ${
                isActive
                  ? "ring-2 ring-cyan-400 bg-polar-850"
                  : "bg-polar-900/90 hover:border-polar-700"
              } ${styles}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{sev}</span>
                <span className="text-lg font-black">{count}</span>
              </div>
              <div className="text-[10px] opacity-75 mt-0.5">
                {count > 0 ? "Action Required" : "Cleared"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-polar-900 border border-polar-750 p-2.5 rounded-lg flex flex-col sm:flex-row gap-2 items-center justify-between text-xs font-mono">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by title or source..."
            className="w-full bg-polar-950 border border-polar-750 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px]">SHOWING: {filtered.length} ALERTS</span>
          {activeFilter !== "ALL" && (
            <button
              onClick={() => setActiveFilter("ALL")}
              className="text-cyan-400 text-[11px] underline ml-2"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const isCrit = alert.severity === "CRITICAL";
          const isWarn = alert.severity === "WARNING";

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all font-mono text-xs space-y-2.5 ${
                alert.acknowledged
                  ? "bg-polar-900/50 border-polar-800 opacity-70"
                  : isCrit
                  ? "bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  : isWarn
                  ? "bg-amber-950/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : "bg-polar-900/90 border-polar-750"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-polar-800">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCrit
                        ? "bg-red-950 text-red-300 border border-red-500/50"
                        : isWarn
                        ? "bg-amber-950 text-amber-300 border border-amber-500/50"
                        : "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <h3 className="font-bold text-white text-sm">{alert.title}</h3>
                </div>

                <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                  <span>Source: {alert.source}</span>
                  <span>{alert.timestamp.replace("T", " ").slice(0, 16)} UTC</span>
                  {alert.acknowledged && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      ACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <p className="text-slate-200 text-xs leading-relaxed font-sans sm:font-mono">
                {alert.message}
              </p>

              {/* Coordinates / Suggested Action Notice */}
              {alert.suggestedAction && (
                <div className="p-2 rounded bg-polar-950 border border-polar-800 text-[11px] text-cyan-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">SUGGESTED ACTION: </span>
                    <span>{alert.suggestedAction}</span>
                  </div>
                  {alert.coordinates && (
                    <span className="text-slate-400 text-[10px]">
                      LOC: {formatCoordinates(alert.coordinates.lat, alert.coordinates.lng)}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewOnMap(alert)}
                    className="py-1 px-3 rounded bg-polar-900 hover:bg-polar-800 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>VIEW ON MAP</span>
                  </button>

                  <Link
                    href="/route-planner"
                    className="py-1 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-cyan-glow"
                  >
                    <span>RECALCULATE ROUTE</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="py-1 px-3 rounded bg-polar-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50 border border-polar-750 transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ACKNOWLEDGE</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
