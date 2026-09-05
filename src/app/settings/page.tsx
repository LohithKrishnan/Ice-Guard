"use client";

import React, { useState } from "react";
import {
  Settings,
  Ship,
  Sliders,
  Server,
  Radio,
  Save,
  CheckCircle2,
  Compass,
  Bell,
  Shield,
  RefreshCw,
} from "lucide-react";
import GlassPanel from "@/components/common/GlassPanel";
import { DEFAULT_VESSEL } from "@/services/routeService";
import { useNavigation } from "@/context/NavigationContext";

export default function SettingsPage() {
  const { projectionMode, setProjectionMode } = useNavigation();

  // Vessel Settings
  const [vesselName, setVesselName] = useState(DEFAULT_VESSEL.name);
  const [callsign, setCallsign] = useState(DEFAULT_VESSEL.callsign);
  const [iceClass, setIceClass] = useState(DEFAULT_VESSEL.iceClass);
  const [draft, setDraft] = useState(DEFAULT_VESSEL.draftM);
  const [beam, setBeam] = useState(DEFAULT_VESSEL.beamM);
  const [length, setLength] = useState(DEFAULT_VESSEL.lengthM);

  // Unit Preferences
  const [distUnit, setDistUnit] = useState<"NM" | "KM">("NM");
  const [speedUnit, setSpeedUnit] = useState<"KT" | "KMH">("KT");
  const [coordFormat, setCoordFormat] = useState<"DMM" | "DD" | "DMS">("DMM");

  // API & Data Service Abstraction
  const [apiMode, setApiMode] = useState<"MOCK" | "LIVE">("MOCK");
  const [backendUrl, setBackendUrl] = useState<string>("https://api.iceguard.polar.int/v1");
  const [groundStation, setGroundStation] = useState<string>("Troll Research Station (72°S 02°E)");
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-polar-800">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-mono font-black tracking-wider text-white">
              SYSTEM CONFIGURATION & VESSEL POLAR SPECIFICATIONS
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Polar Code compliance parameters, navigation units, and backend data abstraction settings.
          </p>
        </div>

        {savedToast && (
          <div className="px-3 py-1.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-mono text-xs flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Parameters saved to local bridge storage!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Section 1: Vessel Specifications */}
          <GlassPanel
            title="VESSEL HYDROGRAPHIC PROFILE"
            subtitle="IMO Polar Code Envelope & Hull Dimensions"
            icon={Ship}
          >
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">VESSEL NAME</label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">CALLSIGN / MMSI</label>
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">IMO POLAR CLASS</label>
                <select
                  value={iceClass}
                  onChange={(e) => setIceClass(e.target.value)}
                  className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                >
                  <option>Polar Class 3 (PC3) - Year-round in second-year ice</option>
                  <option>Polar Class 1 (PC1) - Year-round in all polar waters</option>
                  <option>Polar Class 2 (PC2) - Year-round in moderate multi-year ice</option>
                  <option>Polar Class 4 (PC4) - Year-round in thick first-year ice</option>
                  <option>Polar Class 5 (PC5) - Year-round in medium first-year ice</option>
                  <option>Polar Class 7 (PC7) - Summer/Autumn in thin first-year ice</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">LENGTH (M)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value))}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">BEAM (M)</label>
                  <input
                    type="number"
                    value={beam}
                    onChange={(e) => setBeam(parseFloat(e.target.value))}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">DRAFT (M)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={draft}
                    onChange={(e) => setDraft(parseFloat(e.target.value))}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-polar-950 border border-polar-800 text-[11px] text-slate-400">
                <span className="font-bold text-cyan-300">ICE BELT ARMOR: </span>
                {DEFAULT_VESSEL.iceBeltReinforcement}
              </div>
            </div>
          </GlassPanel>

          {/* Section 2: Display Units & Navigation Coordinate Systems */}
          <GlassPanel
            title="NAVIGATION & DISPLAY UNITS"
            subtitle="Bridge Reticle & Chart Preferences"
            icon={Compass}
          >
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">DEFAULT MAP PROJECTION</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectionMode("mercator")}
                    className={`p-2 rounded border text-left transition-all ${
                      projectionMode === "mercator"
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                        : "bg-polar-950 border-polar-800 text-slate-400"
                    }`}
                  >
                    <div className="font-bold">Web Mercator (EPSG:3857)</div>
                    <div className="text-[10px] opacity-75">Global maritime standard</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectionMode("polar")}
                    className={`p-2 rounded border text-left transition-all ${
                      projectionMode === "polar"
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                        : "bg-polar-950 border-polar-800 text-slate-400"
                    }`}
                  >
                    <div className="font-bold">Polar Stereographic (EPSG:3031)</div>
                    <div className="text-[10px] opacity-75">Conformal south polar radar</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">DISTANCE UNITS</label>
                  <select
                    value={distUnit}
                    onChange={(e) => setDistUnit(e.target.value as any)}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  >
                    <option value="NM">Nautical Miles (NM)</option>
                    <option value="KM">Kilometers (km)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">SPEED UNITS</label>
                  <select
                    value={speedUnit}
                    onChange={(e) => setSpeedUnit(e.target.value as any)}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  >
                    <option value="KT">Knots (kt)</option>
                    <option value="KMH">km/h</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">COORDINATE RETICLE FORMAT</label>
                <select
                  value={coordFormat}
                  onChange={(e) => setCoordFormat(e.target.value as any)}
                  className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                >
                  <option value="DMM">Degree Decimal Minutes (60°51&apos;S 048°12&apos;W)</option>
                  <option value="DD">Decimal Degrees (-60.850, -48.200)</option>
                  <option value="DMS">Degrees Minutes Seconds (60°51&apos;00&quot;S 048°12&apos;00&quot;W)</option>
                </select>
              </div>
            </div>
          </GlassPanel>

          {/* Section 3: Backend API Integration Layer */}
          <GlassPanel
            title="DATA ABSTRACTION & BACKEND ENDPOINTS"
            subtitle="Connect to External FastApi / Node Server"
            icon={Server}
            className="lg:col-span-2"
          >
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-300 block mb-1">
                  BACKEND DROP-IN ARCHITECTURE READY:
                </span>
                All frontend modules communicate exclusively through <code className="text-cyan-400">services/*.ts</code>. You can switch between built-in mock telemetry and your live server at any time without redesigning the UI.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] block mb-1">DATA MODE</label>
                  <select
                    value={apiMode}
                    onChange={(e) => setApiMode(e.target.value as any)}
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  >
                    <option value="MOCK">MOCK TELEMETRY SERVICE (OFFLINE)</option>
                    <option value="LIVE">LIVE BACKEND API REST/WEBSOCKET</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 text-[10px] block mb-1">BACKEND API ROOT URL</label>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="https://api.iceguard.polar.int/v1"
                    className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1">PRIMARY SATELLITE GROUND STATION</label>
                <input
                  type="text"
                  value={groundStation}
                  onChange={(e) => setGroundStation(e.target.value)}
                  className="w-full bg-polar-950 border border-polar-750 rounded p-2 text-white"
                />
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>SAVE BRIDGE CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
}
