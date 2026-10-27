"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Waves,
  Wind,
  Clock,
  MapPin,
  ChevronRight,
  Filter,
  AlertTriangle,
  Info,
  Radio,
  ExternalLink,
  Search,
} from "lucide-react";
import type { HazardItem } from "../map/OceanMapInner";

interface IncoisFeedProps {
  incoisData: HazardItem[];
  selectedHazard: HazardItem | null;
  onSelectHazard: (item: HazardItem) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function IncoisFeed({
  incoisData,
  selectedHazard,
  onSelectHazard,
  isOpen,
  onToggle,
}: IncoisFeedProps) {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredAdvisories = incoisData.filter((item) => {
    const matchesCategory =
      filterCategory === "ALL" ||
      (filterCategory === "CRITICAL" && item.severity.toLowerCase() === "critical") ||
      item.hazardType.toLowerCase().includes(filterCategory.toLowerCase());

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.locationName && item.locationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const criticalCount = incoisData.filter(
    (a) => a.severity.toLowerCase() === "critical"
  ).length;

  return (
    <div
      className={`fixed top-20 right-4 z-30 transition-all duration-300 ease-in-out ${
        isOpen
          ? "w-96 md:w-[420px] max-w-[calc(100vw-32px)]"
          : "w-auto"
      }`}
    >
      {/* Closed State Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group"
        >
          <div className="relative">
            <span className="animate-ping absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 opacity-75"></span>
            <ShieldAlert className="w-5 h-5 text-rose-500 group-hover:rotate-6 transition-transform" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>INCOIS Bulletins</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white font-black">
                {criticalCount} ALERT
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Official Early Warnings
            </p>
          </div>
        </button>
      )}

      {/* Open State Panel */}
      {isOpen && (
        <div className="bg-white/92 dark:bg-zinc-900/92 backdrop-blur-2xl rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[calc(100vh-100px)] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    INCOIS Coastal Alerts
                  </h3>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Govt. of India • Ocean State Forecast
                </p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Search & Category Pills */}
          <div className="px-4 pt-3 pb-2 space-y-2.5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search coastal regions, warnings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
              {[
                { id: "ALL", label: "All" },
                { id: "CRITICAL", label: "Critical Warnings" },
                { id: "wave", label: "High Wave" },
                { id: "surge", label: "Swell Surge" },
                { id: "cyclone", label: "Cyclone Track" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                    filterCategory === tab.id
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                      : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advisories List */}
          <div className="p-3 overflow-y-auto space-y-3 flex-1 divide-y-0">
            {filteredAdvisories.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Info className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  No active warnings matching criteria
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Check again or adjust category filters
                </p>
              </div>
            ) : (
              filteredAdvisories.map((advisory) => {
                const isSelected = selectedHazard?.id === advisory.id;
                const isCritical = advisory.severity.toLowerCase() === "critical";
                const isHigh = advisory.severity.toLowerCase() === "high";

                return (
                  <div
                    key={advisory.id}
                    onClick={() => onSelectHazard(advisory)}
                    className={`group p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-500/50 shadow-md ring-1 ring-blue-500/20"
                        : "bg-white/80 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-xs"
                    }`}
                  >
                    {/* Top Tag & Bulletin ID */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          isCritical
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                            : isHigh
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300"
                        }`}
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {advisory.severity} Alert
                      </span>

                      <span className="text-[10px] text-zinc-400 font-mono">
                        {advisory.createdAt ? new Date(advisory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {advisory.title}
                    </h4>

                    {/* Affected Region */}
                    {advisory.locationName && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{advisory.locationName}</span>
                      </p>
                    )}

                    {/* Ocean Parameters Grid */}
                    {advisory.parameters && (
                      <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 text-[10px] mb-2.5">
                        {advisory.parameters.waveHeight && (
                          <div className="flex items-center gap-1">
                            <Waves className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                              {advisory.parameters.waveHeight}
                            </span>
                          </div>
                        )}
                        {advisory.parameters.windSpeed && (
                          <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-cyan-500 shrink-0" />
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                              {advisory.parameters.windSpeed}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Operational Instruction */}
                    {advisory.instruction && (
                      <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 mb-2.5 leading-snug">
                        <span className="font-semibold block mb-0.5">Maritime Advisory:</span>
                        {advisory.instruction}
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-[10px] text-zinc-400 truncate max-w-[190px]">
                        {advisory.userName || "INCOIS Hyd."}
                      </span>
                      <button className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>Locate on Map</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Official Verification Badge */}
          <div className="p-3 bg-zinc-50/80 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live INCOIS Link Active
            </span>
            <a
              href="https://incois.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              incois.gov.in <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
