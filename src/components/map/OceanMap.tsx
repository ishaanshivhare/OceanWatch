"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Waves, Loader2 } from "lucide-react";
import type { HazardItem } from "./OceanMapInner";

// Dynamic import with ssr: false for Leaflet compatibility in Next.js
const OceanMapInner = dynamic(() => import("./OceanMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900 text-slate-300">
      <div className="relative flex items-center justify-center mb-4">
        <span className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-blue-500/20"></span>
        <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center backdrop-blur-md">
          <Waves className="w-7 h-7 text-blue-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-semibold tracking-wide text-slate-200">
        Rendering Ocean Bathymetry & Coastal Radar...
      </p>
      <p className="text-xs text-slate-400 mt-1">Synchronizing INCOIS Feeds & Sentinel Observatories</p>
    </div>
  ),
});

interface OceanMapProps {
  hazards: HazardItem[];
  selectedHazard: HazardItem | null;
  onSelectHazard: (item: HazardItem | null) => void;
  pinMode?: boolean;
  onPinLocation?: (coords: { lat: number; lng: number }) => void;
  pinnedCoords?: { lat: number; lng: number } | null;
  activeFilter?: string;
}

export function OceanMap(props: OceanMapProps) {
  return (
    <div className="w-full h-full relative">
      <OceanMapInner {...props} />
    </div>
  );
}

export default OceanMap;
