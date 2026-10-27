"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { OceanMap } from "@/components/map/OceanMap";
import { IncoisFeed } from "@/components/feed/IncoisFeed";
import { ReportHazardModal } from "@/components/report/ReportHazardModal";
import { MapControlHUD } from "@/components/dashboard/MapControlHUD";
import { HazardDetailDrawer } from "@/components/dashboard/HazardDetailDrawer";
import type { HazardItem } from "@/components/map/OceanMapInner";
import type { IncoisAdvisory } from "@/app/api/incois/route";
import {
  ShieldAlert,
  Radio,
  AlertTriangle,
  Activity,
  Waves,
} from "lucide-react";

export default function HomePage() {
  const [hazards, setHazards] = useState<HazardItem[]>([]);
  const [incoisData, setIncoisData] = useState<HazardItem[]>([]);
  const [crowdsourcedData, setCrowdsourcedData] = useState<HazardItem[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<HazardItem | null>(null);

  // UI state
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isIncoisFeedOpen, setIsIncoisFeedOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [pinMode, setPinMode] = useState<boolean>(false);
  const [pinnedCoords, setPinnedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch official INCOIS early warnings
  const fetchIncois = async () => {
    try {
      const res = await fetch("/api/incois");
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        const transformed: HazardItem[] = json.data.map(
          (item: IncoisAdvisory) => ({
            id: item.id,
            title: item.title,
            hazardType: item.category.replace(/_/g, " "),
            severity: item.severity,
            latitude: item.coordinates.lat,
            longitude: item.coordinates.lng,
            locationName: item.coastalRegions.join(", "),
            description: item.instruction,
            source: "incois",
            status: item.status,
            userName: item.source,
            createdAt: item.issuedAt,
            parameters: item.parameters,
            instruction: item.instruction,
            coverageRadiusKm: item.coverageRadiusKm,
          }),
        );
        setIncoisData(transformed);
        return transformed;
      }
    } catch (e) {
      console.error("Error loading INCOIS data:", e);
    }
    return [];
  };

  // Fetch crowdsourced reports from database
  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformed: HazardItem[] = json.data.map((r: any) => ({
          id: r.id,
          title: r.title,
          hazardType: r.hazardType,
          severity: r.severity,
          latitude: r.latitude,
          longitude: r.longitude,
          locationName: r.locationName,
          description: r.description,
          source: "crowdsourced",
          status: r.status,
          userName: r.userName || "Maritime Observer",
          createdAt: r.createdAt,
        }));
        setCrowdsourcedData(transformed);
        return transformed;
      }
    } catch (e) {
      console.error("Error loading user reports:", e);
    }
    return [];
  };

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    const [inc, crowd] = await Promise.all([fetchIncois(), fetchReports()]);
    setHazards([...inc, ...crowd]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle map click when pinning for report
  const handleMapPin = (coords: { lat: number; lng: number }) => {
    setPinnedCoords(coords);
    setPinMode(false);
    setIsReportModalOpen(true);
  };

  // Filter hazards
  const visibleHazards = hazards.filter((h) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "critical")
      return h.severity.toLowerCase() === "critical";
    if (activeFilter === "incois") return h.source === "incois";
    if (activeFilter === "crowdsourced") return h.source === "crowdsourced";
    if (activeFilter === "waves") {
      return (
        h.hazardType.toLowerCase().includes("wave") ||
        h.hazardType.toLowerCase().includes("surge")
      );
    }
    if (activeFilter === "oil") {
      return h.hazardType.toLowerCase().includes("oil");
    }
    return true;
  });

  const criticalCount = hazards.filter(
    (h) => h.severity.toLowerCase() === "critical",
  ).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Glass Navbar */}
      <Navbar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onToggleIncoisFeed={() => setIsIncoisFeedOpen(!isIncoisFeedOpen)}
        incoisCount={incoisData.length}
        reportCount={crowdsourcedData.length}
        criticalCount={criticalCount}
      />

      {/* Main Interactive Map Surface */}
      <main className="w-full h-full relative">
        <OceanMap
          hazards={visibleHazards}
          selectedHazard={selectedHazard}
          onSelectHazard={(h) => setSelectedHazard(h)}
          pinMode={pinMode}
          onPinLocation={handleMapPin}
          pinnedCoords={pinnedCoords}
          activeFilter={activeFilter}
        />

        {/* Floating Map HUD Controls */}
        <MapControlHUD
          activeFilter={activeFilter}
          onFilterChange={(f) => setActiveFilter(f)}
          onResetView={() => setSelectedHazard(null)}
          onLocateMe={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setSelectedHazard({
                  id: "my-pos",
                  title: "Your Monitored Coastal Location",
                  hazardType: "GPS Fix",
                  severity: "Low",
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  description: "Current coastal geolocation fix.",
                  source: "crowdsourced",
                  createdAt: new Date().toISOString(),
                });
              });
            }
          }}
          pinMode={pinMode}
          onCancelPinMode={() => setPinMode(false)}
          totalVisible={visibleHazards.length}
        />

        {/* INCOIS Official Advisories Slide-out Panel */}
        <IncoisFeed
          incoisData={incoisData}
          selectedHazard={selectedHazard}
          onSelectHazard={(item) => setSelectedHazard(item)}
          isOpen={isIncoisFeedOpen}
          onToggle={() => setIsIncoisFeedOpen(!isIncoisFeedOpen)}
        />

        {/* Selected Hazard Card Detail Drawer */}
        <HazardDetailDrawer
          hazard={selectedHazard}
          onClose={() => setSelectedHazard(null)}
        />

        {/* Floating Bottom Telemetry Pill */}
        <div className="absolute bottom-6 right-4 z-20 hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-lg text-xs">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
              Indian Ocean Basin
            </span>
          </div>

          <span className="text-zinc-300 dark:text-zinc-700">|</span>

          <span className="text-[11px] text-zinc-500">
            {incoisData.length} INCOIS Alerts Active
          </span>

          <span className="text-zinc-300 dark:text-zinc-700">|</span>

          <span className="text-[11px] text-zinc-500">
            {crowdsourcedData.length} Crowdsourced Pins
          </span>
        </div>
      </main>

      {/* Crowdsourced Hazard Reporting Modal */}
      <ReportHazardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={refreshAllData}
        initialCoords={pinnedCoords}
        onEnablePinMode={() => setPinMode(true)}
      />
    </div>
  );
}
