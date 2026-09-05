"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Snowflake,
  TriangleAlert,
  ShieldAlert,
  Compass,
  Ship,
  Navigation,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Sliders,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import KpiCard from "@/components/common/KpiCard";
import GlassPanel from "@/components/common/GlassPanel";
import RiskGauge from "@/components/common/RiskGauge";
import { useSimulation } from "@/context/SimulationContext";
import { useNavigation } from "@/context/NavigationContext";
import { getSeaIceData } from "@/services/seaIceService";
import { getIcebergs } from "@/services/icebergService";
import { getRiskAssessment } from "@/services/riskService";
import { getAlerts } from "@/services/alertService";
import { SeaIceData, Iceberg, RiskAssessment, MaritimeAlert } from "@/services/types";
import { formatCoordinates } from "@/lib/utils";

// Dynamically import map with ssr: false to prevent Leaflet SSR issues
const AntarcticMap = dynamic(() => import("@/components/map/AntarcticMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[560px] bg-polar-950 flex flex-col items-center justify-center text-cyan-400 font-mono text-sm space-y-3">
      <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      <span>INITIALIZING ANTARCTIC TACTICAL SURFACE...</span>
    </div>
  ),
});

export default function DashboardPage() {
  const { snapshot, currentStep, setStep } = useSimulation();
  const { setSelectedIcebergId } = useNavigation();

  const [seaIce, setSeaIce] = useState<SeaIceData | null>(null);
  const [icebergs, setIcebergs] = useState<Iceberg[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [alerts, setAlerts] = useState<MaritimeAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [iceData, bergData, riskData, alertData] = await Promise.all([
          getSeaIceData(),
          getIcebergs(),
          getRiskAssessment(),
          getAlerts(),
        ]);
        setSeaIce(iceData);
        setIcebergs(bergData);
        setRisk(riskData);
        setAlerts(alertData);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL" && !a.acknowledged);

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-xl sm:text-2xl font-mono font-black tracking-wider text-white">
              ANTARCTIC NAVIGATION INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            AI-powered monitoring and decision support for Antarctic maritime operations.
          </p>
        </div>

        {/* Quick Route Status Banner */}
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-lg bg-polar-900 border border-polar-750 flex items-center space-x-2 text-xs font-mono">
            <Ship className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">ROUTE:</span>
            <span className="text-cyan-300 font-bold">BALANCED AI (RECOMMENDED)</span>
            <span className="text-emerald-400 text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30">
              OPTIMIZED
            </span>
          </div>

          <Link
            href="/route-planner"
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-semibold text-xs transition-colors shadow-cyan-glow flex items-center space-x-1"
          >
            <span>PLAN ROUTE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Critical Threat Alert Banner (if any) */}
      {criticalAlerts.length > 0 && (
        <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded bg-red-500 text-white flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 font-mono font-bold text-red-200">
                <span>TACTICAL HAZARD DETECTED:</span>
                <span className="text-white">{criticalAlerts[0].title}</span>
              </div>
              <p className="text-red-300 text-[11px] mt-0.5 font-mono">
                {criticalAlerts[0].message}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Link
              href="/route-planner"
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[11px] whitespace-nowrap shadow-sm"
            >
              RECALCULATE ROUTE
            </Link>
            <Link
              href="/alerts"
              className="px-3 py-1.5 rounded bg-polar-900 hover:bg-polar-800 text-slate-300 font-mono text-[11px] border border-polar-750"
            >
              DISMISS
            </Link>
          </div>
        </div>
      )}

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="SEA-ICE COVERAGE"
          value={seaIce ? `${seaIce.overallCoveragePercent}%` : "78.4%"}
          change="-0.8% / 72h"
          trend="down"
          trendSeverity="positive"
          icon={Snowflake}
          colorScheme="cyan"
          footerNotice="AMSR2 / Sentinel-1 Sync"
        />
        <KpiCard
          label="ACTIVE ICEBERGS"
          value="1,284"
          subValue="6 Classified Mega-Bergs"
          change="+14 Calved"
          trend="up"
          trendSeverity="warning"
          icon={TriangleAlert}
          colorScheme="blue"
          footerNotice="USNIC NIC Polar Catalog"
        />
        <KpiCard
          label="HIGH-RISK ZONES"
          value={risk ? `${risk.riskZones.length}` : "12"}
          subValue="4 Active Corridors"
          change="3 Near Course"
          trend="neutral"
          trendSeverity="warning"
          icon={ShieldAlert}
          colorScheme="amber"
          footerNotice="Dynamic Compression Radar"
        />
        <KpiCard
          label="NAVIGATION RISK"
          value={snapshot.riskAssessment.overallRiskScore}
          subValue="/ 100"
          change={snapshot.riskAssessment.status}
          trend="neutral"
          trendSeverity={snapshot.riskAssessment.overallRiskScore > 60 ? "warning" : "positive"}
          icon={Compass}
          colorScheme={snapshot.riskAssessment.overallRiskScore > 60 ? "rose" : "emerald"}
          footerNotice="Bayesian Risk Classifier v3"
        />
      </div>

      {/* Centerpiece Layout: Antarctic Map + Command Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Centerpiece Map (spans 3 cols on xl) */}
        <div className="xl:col-span-3 rounded-lg overflow-hidden border border-polar-750 shadow-2xl relative min-h-[580px] flex flex-col bg-polar-950">
          <AntarcticMap />
        </div>

        {/* Right Tactical Sidebar */}
        <div className="space-y-4 flex flex-col">
          {/* Real-Time Risk Gauge Card */}
          <GlassPanel
            title="ROUTE RISK EVALUATION"
            subtitle="Polar Code Risk Metric"
            icon={ShieldAlert}
          >
            <RiskGauge
              score={snapshot.riskAssessment.overallRiskScore}
              subLabel="R/V POLARIS V (PC3) - Active Vector"
            />

            <div className="mt-2 space-y-2 border-t border-polar-800 pt-3 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Sea-Ice Hazard:</span>
                <span className="text-cyan-300 font-bold">{snapshot.riskAssessment.seaIceRisk}/100</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Iceberg Hazard:</span>
                <span className="text-red-400 font-bold">{snapshot.riskAssessment.icebergRisk}/100</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Weather/Katabatic:</span>
                <span className="text-amber-400 font-bold">{snapshot.riskAssessment.weatherRisk}/100</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded bg-cyan-950/30 border border-cyan-500/30 text-[11px] font-mono text-cyan-200">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI RECOMMENDATION:
              </div>
              <p className="line-clamp-3 text-slate-300 leading-snug">
                {snapshot.riskAssessment.aiRecommendation}
              </p>
              <Link
                href="/risk"
                className="mt-2 text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Full Risk Analysis</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </GlassPanel>

          {/* High Priority Tracked Targets */}
          <GlassPanel
            title="PRIORITY TARGETS"
            subtitle="Radar Kinematics (72h Horizon)"
            icon={TriangleAlert}
            className="flex-1"
          >
            <div className="space-y-2.5">
              {icebergs.slice(0, 3).map((berg) => (
                <div
                  key={berg.id}
                  onClick={() => setSelectedIcebergId(berg.id)}
                  className="p-2.5 rounded bg-polar-950/80 border border-polar-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {berg.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold ${
                        berg.riskTier === "CRITICAL"
                          ? "bg-red-950 text-red-300 border border-red-500/40"
                          : "bg-amber-950 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {berg.riskTier}
                    </span>
                  </div>

                  <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                    <div>POS: {formatCoordinates(berg.latitude, berg.longitude)}</div>
                    <div>SIZE: {berg.sizeKm.length}×{berg.sizeKm.width}km</div>
                    <div>DRIFT: {berg.driftSpeedKnots}kt @ {berg.driftDirectionDeg}°</div>
                    <div className="text-emerald-400">CONF: {berg.detectionConfidence}%</div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-polar-800 flex items-center justify-between text-[10px]">
                    <Link
                      href={`/icebergs/${berg.id}`}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Trajectory Deep-Dive
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <span className="text-slate-500 font-mono">T+72h: ±{berg.predictions["72h"].uncertaintyRadiusKm}km</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
