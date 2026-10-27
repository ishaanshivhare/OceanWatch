"use client";

import React from "react";
import {
  Layers,
  AlertTriangle,
  ShieldAlert,
  Radio,
  Waves,
  Droplet,
  Compass,
  RotateCcw,
  Eye,
  Check,
} from "lucide-react";

interface MapControlHUDProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onResetView: () => void;
  onLocateMe: () => void;
  pinMode: boolean;
  onCancelPinMode: () => void;
  totalVisible: number;
}

export function MapControlHUD({
  activeFilter,
  onFilterChange,
  onResetView,
  onLocateMe,
  pinMode,
  onCancelPinMode,
  totalVisible,
}: MapControlHUDProps) {
  const filters = [
    { id: "all", label: "All Hazards", icon: Layers },
    { id: "critical", label: "Critical", icon: AlertTriangle, color: "text-rose-500" },
    { id: "incois", label: "INCOIS Alerts", icon: ShieldAlert, color: "text-blue-500" },
    { id: "crowdsourced", label: "Crowdsourced", icon: Radio, color: "text-emerald-500" },
    { id: "waves", label: "Waves & Surges", icon: Waves, color: "text-cyan-500" },
    { id: "oil", label: "Oil Spills", icon: Droplet, color: "text-amber-500" },
  ];

  return (
    <>
      {/* Top Left Floating Filter Bar */}
      <div className="absolute top-20 left-4 z-20 flex flex-col gap-2 max-w-[calc(100vw-32px)]">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-white/60 dark:border-zinc-800/80 shadow-lg flex items-center gap-1 overflow-x-auto no-scrollbar">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${f.color || ""}`} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Total Visible Indicator */}
        <div className="self-start px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{totalVisible} Active Geo-Pins</span>
        </div>
      </div>

      {/* Pin Mode Alert Banner */}
      {pinMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-5 py-2.5 rounded-full bg-blue-600 text-white shadow-2xl flex items-center gap-3 border border-blue-400/30">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span className="text-xs font-bold">
              Tap anywhere on the ocean or coastline to set coordinates
            </span>
            <button
              onClick={onCancelPinMode}
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floating Map Navigation Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 flex items-center gap-2">
        <button
          onClick={onLocateMe}
          title="Detect My Location"
          className="p-3 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-lg text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4" />
        </button>

        <button
          onClick={onResetView}
          title="Reset Ocean Overview"
          className="p-3 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-lg text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
