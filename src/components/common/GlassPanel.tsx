"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface GlassPanelProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerBorder?: boolean;
}

export default function GlassPanel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
  headerBorder = true,
}: GlassPanelProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`}
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        boxShadow: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 4px 24px -4px rgba(0,0,0,0.7)",
      }}
    >
      {(title || action) && (
        <div
          className="flex items-center justify-between"
          style={{
            padding: "12px 16px",
            borderBottom: headerBorder ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div
                className="flex items-center justify-center rounded"
                style={{
                  width: 28,
                  height: 28,
                  background: "rgba(184,165,138,0.08)",
                  border: "1px solid rgba(184,165,138,0.15)",
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: "#B8A58A" }} />
              </div>
            )}
            <div>
              {title && (
                <h3
                  className="font-semibold uppercase tracking-widest"
                  style={{ color: "#F2F0EB", fontSize: 10, letterSpacing: "0.12em" }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-0.5" style={{ color: "#4A4540", fontSize: 10 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}
