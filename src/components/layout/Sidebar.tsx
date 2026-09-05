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
} from "lucide-react";
import { MOCK_ALERTS } from "@/services/alertService";

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadAlerts = MOCK_ALERTS.filter((a) => !a.acknowledged).length;

  const navItems = [
    { label: "Dashboard",     href: "/",            icon: Compass     },
    { label: "Sea Ice",       href: "/sea-ice",     icon: Snowflake   },
    { label: "Icebergs",      href: "/icebergs",    icon: TriangleAlert },
    { label: "Route Planner", href: "/route-planner", icon: Navigation },
    { label: "Risk Analysis", href: "/risk",         icon: ShieldAlert },
    { label: "Satellite",     href: "/satellite",    icon: Satellite   },
    { label: "AI Predictions",href: "/predictions",  icon: Cpu         },
    { label: "Alerts",        href: "/alerts",       icon: BellRing, badge: unreadAlerts },
    { label: "Analytics",     href: "/analytics",    icon: LineChart   },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3 rounded-full flex items-center justify-center focus:outline-none"
          style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.08)" }}
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-4 h-4 text-sand-100" /> : <Menu className="w-4 h-4 text-sand-100" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(13,13,13,0.85)", backdropFilter: "blur(4px)" }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: 220,
          background: "#0D0D0D",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Brand */}
        <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 group">
            <div
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "#1A1A1A", border: "1px solid rgba(184,165,138,0.25)" }}
            >
              <Compass className="w-4 h-4" style={{ color: "#B8A58A" }} />
            </div>
            <div>
              <div className="font-semibold tracking-wider text-sm" style={{ color: "#F2F0EB", letterSpacing: "0.08em" }}>
                ICEGUARD<span style={{ color: "#B8A58A" }}> AI</span>
              </div>
              <div className="text-[9px] tracking-widest uppercase mt-0.5" style={{ color: "#4A4540", letterSpacing: "0.15em" }}>
                Antarctic Intel
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div
            className="text-[9px] uppercase tracking-widest px-2 mb-3 font-medium"
            style={{ color: "#4A4540", letterSpacing: "0.18em" }}
          >
            Navigation
          </div>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all"
                  style={
                    isActive
                      ? {
                          background: "rgba(184,165,138,0.08)",
                          color: "#B8A58A",
                          border: "1px solid rgba(184,165,138,0.15)",
                        }
                      : {
                          color: "#8C8578",
                          border: "1px solid transparent",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#F2F0EB";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "#8C8578";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? "#B8A58A" : "#4A4540" }} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(139,42,42,0.25)", color: "#C87878", border: "1px solid rgba(139,42,42,0.4)" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {/* System status */}
          <div
            className="mt-3 p-2.5 rounded-md text-xs"
            style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: "#4A4540" }}>
                <Activity className="w-3 h-3" style={{ color: "#4A7C59" }} />
                System
              </span>
              <span className="text-[10px] font-medium" style={{ color: "#4A7C59" }}>99.8%</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ background: "#1A1A1A", height: 2 }}>
              <div className="h-full rounded-full transition-all" style={{ width: "99.8%", background: "#4A7C59" }} />
            </div>
            <div className="mt-2 flex items-center justify-between" style={{ color: "#4A4540", fontSize: "10px" }}>
              <span>42ms</span>
              <span className="flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse-bronze" style={{ color: "#B8A58A" }} />
                TROLL
              </span>
            </div>
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all"
            style={
              pathname === "/settings"
                ? { color: "#B8A58A", background: "rgba(184,165,138,0.08)", border: "1px solid rgba(184,165,138,0.15)" }
                : { color: "#8C8578", border: "1px solid transparent" }
            }
          >
            <Settings className="w-3.5 h-3.5" style={{ color: "#4A4540" }} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
