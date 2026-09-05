import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskSeverity } from "@/services/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLat(lat: number): string {
  const hemi = lat >= 0 ? "N" : "S";
  const abs = Math.abs(lat);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  return `${deg.toString().padStart(2, "0")}°${min.toString().padStart(2, "0")}'${hemi}`;
}

export function formatLng(lng: number): string {
  const hemi = lng >= 0 ? "E" : "W";
  const abs = Math.abs(lng);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  return `${deg.toString().padStart(3, "0")}°${min.toString().padStart(2, "0")}'${hemi}`;
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${formatLat(lat)} ${formatLng(lng)}`;
}

export function getRiskColor(severity: RiskSeverity | string): {
  badge: string;
  border: string;
  text: string;
  bg: string;
  glow: string;
} {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return {
        badge: "bg-red-950/80 text-red-400 border-red-500/50",
        border: "border-red-500/40",
        text: "text-red-400",
        bg: "bg-red-500/10",
        glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
      };
    case "HIGH":
      return {
        badge: "bg-orange-950/80 text-orange-400 border-orange-500/50",
        border: "border-orange-500/40",
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        glow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]",
      };
    case "ELEVATED":
    case "MODERATE":
    case "WARNING":
      return {
        badge: "bg-amber-950/80 text-amber-400 border-amber-500/50",
        border: "border-amber-500/40",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      };
    case "LOW":
    case "ADVISORY":
    case "NOMINAL":
    default:
      return {
        badge: "bg-emerald-950/80 text-emerald-400 border-emerald-500/50",
        border: "border-emerald-500/40",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.25)]",
      };
  }
}

export function calculateDistanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
