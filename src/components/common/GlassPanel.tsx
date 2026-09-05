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
      className={`bg-polar-900/90 backdrop-blur-md border border-polar-750/90 rounded-lg shadow-panel-glow flex flex-col overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div
          className={`px-4 py-3 flex items-center justify-between ${
            headerBorder ? "border-b border-polar-800" : ""
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className="p-1.5 rounded bg-polar-800 border border-polar-700 text-cyan-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[10px] text-slate-400 font-mono">{subtitle}</p>
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
