"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Snowflake,
  TriangleAlert,
  Navigation,
  ShieldAlert,
  Satellite,
  Cpu,
  BellRing,
  LineChart,
  Settings,
  Activity,
  Menu,
  X,
  Radio,
  ExternalLink,
} from "lucide-react";
import { MOCK_ALERTS } from "@/services/alertService";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadAlerts = MOCK_ALERTS.filter((a) => !a.acknowledged).length;

  const navItems = [
    { label: "Dashboard", href: "/", icon: Compass },
    { label: "Sea Ice", href: "/sea-ice", icon: Snowflake },
    { label: "Icebergs", href: "/icebergs", icon: TriangleAlert },
    { label: "Route Planner", href: "/route-planner", icon: Navigation },
    { label: "Risk Analysis", href: "/risk", icon: ShieldAlert },
    { label: "Satellite Data", href: "/satellite", icon: Satellite },
    { label: "AI Predictions", href: "/predictions", icon: Cpu },
    { label: "Alerts", href: "/alerts", icon: BellRing, badge: unreadAlerts },
    { label: "Analytics", href: "/analytics", icon: LineChart },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg border border-cyan-300 flex items-center justify-center focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-polar-950/80 backdrop-blur-sm z-40"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-polar-950 border-r border-polar-750/70 flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-polar-750/70">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-start space-x-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-cyan-glow border border-cyan-400/40 group-hover:scale-105 transition-transform flex-shrink-0">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="font-mono font-black tracking-wider text-base text-white flex items-center gap-1.5">
                ICEGUARD <span className="text-cyan-400 font-extrabold">AI</span>
              </div>
              <div className="text-[9px] tracking-widest uppercase font-mono font-medium text-slate-400">
                ANTARCTIC MARITIME INTEL
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
          <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase text-slate-500 font-semibold">
            NAVIGATION MODULES
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-polar-900/80 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-cyan-400"
                        : "text-slate-400 group-hover:text-cyan-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-500/20 border border-red-500/40 text-red-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-polar-750/70 space-y-2 bg-polar-900/40">
          {/* System Status Box */}
          <div className="p-2.5 rounded bg-polar-900/80 border border-polar-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400" />
                SYSTEM HEALTH
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                99.8%
              </span>
            </div>
            <div className="w-full bg-polar-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                style={{ width: "99.8%" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>LATENCY: 42ms</span>
              <span className="text-cyan-300 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
                TROLL SYNC
              </span>
            </div>
          </div>

          {/* Settings link */}
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-polar-900"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Vessel Specs</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
