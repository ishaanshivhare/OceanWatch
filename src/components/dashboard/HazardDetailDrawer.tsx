"use client";

import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Radio,
  MapPin,
  Clock,
  User,
  X,
  Compass,
  Waves,
  Wind,
  Share2,
  ExternalLink,
} from "lucide-react";
import type { HazardItem } from "../map/OceanMapInner";

interface HazardDetailDrawerProps {
  hazard: HazardItem | null;
  onClose: () => void;
}

export function HazardDetailDrawer({ hazard, onClose }: HazardDetailDrawerProps) {
  if (!hazard) return null;

  const isCritical = hazard.severity.toLowerCase() === "critical";
  const isHigh = hazard.severity.toLowerCase() === "high";
  const isMedium = hazard.severity.toLowerCase() === "medium";
  const isOfficial = hazard.source === "incois";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-6 duration-200">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl p-5 md:p-6 overflow-hidden relative">
        {/* Top Badges & Close */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isCritical
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  : isHigh
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : isMedium
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{hazard.severity} Severity</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
              {isOfficial ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  INCOIS Early Warning
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  Crowdsourced Report
                </>
              )}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hazard Title */}
        <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-2">
          {hazard.title}
        </h3>

        {/* Location & Coordinates */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-3.5">
          {hazard.locationName && (
            <div className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{hazard.locationName}</span>
            </div>
          )}
          <div className="flex items-center gap-1 font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
            <Compass className="w-3 h-3 text-zinc-400" />
            <span>
              {hazard.latitude.toFixed(4)}°N, {hazard.longitude.toFixed(4)}°E
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
          {hazard.description}
        </p>

        {/* Telemetry Grid if present */}
        {hazard.parameters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 mb-4 text-xs">
            {hazard.parameters.waveHeight && (
              <div>
                <span className="text-[10px] text-zinc-400 block font-medium">Wave Height</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {hazard.parameters.waveHeight}
                </span>
              </div>
            )}
            {hazard.parameters.windSpeed && (
              <div>
                <span className="text-[10px] text-zinc-400 block font-medium">Wind Speed</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {hazard.parameters.windSpeed}
                </span>
              </div>
            )}
            {hazard.parameters.swellPeriod && (
              <div>
                <span className="text-[10px] text-zinc-400 block font-medium">Swell Period</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {hazard.parameters.swellPeriod}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Instruction if present */}
        {hazard.instruction && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 mb-4">
            <span className="font-bold block mb-1">Emergency Maritime Directive:</span>
            <span>{hazard.instruction}</span>
          </div>
        )}

        {/* Footer info & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(hazard.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            {hazard.userName && (
              <span className="flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-300">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                {hazard.userName}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: hazard.title,
                  text: hazard.description,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
