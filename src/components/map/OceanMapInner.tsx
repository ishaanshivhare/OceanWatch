"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  Waves,
  ShieldAlert,
  Clock,
  MapPin,
  ExternalLink,
  User,
  Radio,
  CheckCircle,
  Compass,
  Layers,
  Check,
} from "lucide-react";

// Fix default Leaflet icon paths in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface HazardItem {
  id: string;
  title: string;
  hazardType: string;
  severity: "Critical" | "High" | "Medium" | "Low" | string;
  latitude: number;
  longitude: number;
  locationName?: string | null;
  description: string;
  source: "crowdsourced" | "incois";
  status?: string;
  userName?: string | null;
  createdAt: string;
  parameters?: {
    waveHeight?: string;
    swellPeriod?: string;
    windSpeed?: string;
    currentSpeed?: string;
  };
  instruction?: string;
  coverageRadiusKm?: number;
}

export type BasemapMode = "ocean" | "osm" | "satellite" | "dark";

interface OceanMapInnerProps {
  hazards: HazardItem[];
  selectedHazard: HazardItem | null;
  onSelectHazard: (item: HazardItem | null) => void;
  pinMode?: boolean;
  onPinLocation?: (coords: { lat: number; lng: number }) => void;
  pinnedCoords?: { lat: number; lng: number } | null;
  activeFilter?: string;
}

// Custom animated SVG DivIcons for high-end Apple-like aesthetic
const createCustomMarker = (
  severity: string,
  source: string,
  isSelected: boolean
) => {
  const isCritical = severity.toLowerCase() === "critical";
  const isHigh = severity.toLowerCase() === "high";
  const isMedium = severity.toLowerCase() === "medium";

  let color = "#3b82f6"; // Blue (Low/Advisory)
  let ringColor = "rgba(59, 130, 246, 0.4)";
  let pulse = false;

  if (isCritical) {
    color = "#ef4444"; // Red
    ringColor = "rgba(239, 68, 68, 0.45)";
    pulse = true;
  } else if (isHigh) {
    color = "#f97316"; // Orange
    ringColor = "rgba(249, 115, 22, 0.45)";
    pulse = true;
  } else if (isMedium) {
    color = "#eab308"; // Yellow
    ringColor = "rgba(234, 179, 8, 0.4)";
  }

  const isOfficial = source.toLowerCase() === "incois";
  const size = isSelected ? 42 : 34;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        pulse
          ? `<span style="position: absolute; width: ${size * 1.5}px; height: ${size * 1.5}px; border-radius: 9999px; background-color: ${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
          : ""
      }
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${isOfficial ? "10px" : "9999px"};
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid white;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
        transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        ${
          isOfficial
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="m4 8 16-4"/><path d="m4 4 16 4"/></svg>`
        }
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-ocean-pin",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createPinnedMarker = () => {
  return L.divIcon({
    className: "custom-pinned-marker",
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 50px; height: 50px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.35); animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 34px; height: 34px; background: #2563eb; border-radius: 9999px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(37,99,235,0.5);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

function MapClickHandler({
  pinMode,
  onPinLocation,
}: {
  pinMode?: boolean;
  onPinLocation?: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      if (pinMode && onPinLocation) {
        onPinLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

function FlyToSelected({ selectedHazard }: { selectedHazard: HazardItem | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedHazard) {
      map.flyTo([selectedHazard.latitude, selectedHazard.longitude], 8, {
        duration: 1.2,
      });
    }
  }, [selectedHazard, map]);
  return null;
}

// Invalidate size to guarantee crisp map rendering without blank grey rectangles
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

export default function OceanMapInner({
  hazards,
  selectedHazard,
  onSelectHazard,
  pinMode,
  onPinLocation,
  pinnedCoords,
}: OceanMapInnerProps) {
  // Center of Indian Ocean waters (Peninsular India, Lakshadweep, Bay of Bengal)
  const defaultCenter: [number, number] = [14.0, 78.5];
  const defaultZoom = 5;

  // Active basemap layer (defaults to ocean bathymetry)
  const [basemap, setBasemap] = useState<BasemapMode>("ocean");
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{
          background:
            basemap === "ocean"
              ? "#0c1e33"
              : basemap === "satellite"
              ? "#050b14"
              : basemap === "dark"
              ? "#18181b"
              : "#cbd5e1",
        }}
      >
        <MapResizer />

        {/* 1. Ocean Bathymetry (ESRI Marine & Depth Topography - Free & High Resolution) */}
        {basemap === "ocean" && (
          <>
            <TileLayer
              key="ocean-base"
              attribution='Tiles &copy; Esri &mdash; GEBCO, NOAA, CHS, National Geographic'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={13}
              maxZoom={18}
            />
            <TileLayer
              key="ocean-ref"
              attribution='Esri World Ocean Reference'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={13}
              maxZoom={18}
            />
          </>
        )}

        {/* 2. OpenStreetMap Standard (High Detail Coastal & Ports - Free) */}
        {basemap === "osm" && (
          <TileLayer
            key="osm-base"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={["a", "b", "c"]}
            maxNativeZoom={19}
            maxZoom={19}
          />
        )}

        {/* 3. Satellite Imagery (ESRI World Imagery - Free) */}
        {basemap === "satellite" && (
          <>
            <TileLayer
              key="sat-base"
              attribution='Tiles &copy; Esri, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={19}
            />
            <TileLayer
              key="sat-ref"
              attribution='Esri Boundaries'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={19}
            />
          </>
        )}

        {/* 4. Dark Gray Tactical Canvas (ESRI Dark - Free) */}
        {basemap === "dark" && (
          <>
            <TileLayer
              key="dark-base"
              attribution='Tiles &copy; Esri, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={16}
              maxZoom={18}
            />
            <TileLayer
              key="dark-ref"
              attribution='Esri Reference'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={16}
              maxZoom={18}
            />
          </>
        )}

        <MapClickHandler pinMode={pinMode} onPinLocation={onPinLocation} />
        <FlyToSelected selectedHazard={selectedHazard} />

        {/* Hazard Markers */}
        {hazards.map((item) => {
          const isSelected = selectedHazard?.id === item.id;
          const markerIcon = createCustomMarker(item.severity, item.source, isSelected);

          return (
            <React.Fragment key={item.id}>
              {/* Coverage circle for official alerts with specified radius */}
              {item.source === "incois" && item.coverageRadiusKm && (
                <Circle
                  center={[item.latitude, item.longitude]}
                  radius={item.coverageRadiusKm * 1000}
                  pathOptions={{
                    color:
                      item.severity.toLowerCase() === "critical"
                        ? "#ef4444"
                        : item.severity.toLowerCase() === "high"
                        ? "#f97316"
                        : "#3b82f6",
                    fillColor:
                      item.severity.toLowerCase() === "critical"
                        ? "#ef4444"
                        : item.severity.toLowerCase() === "high"
                        ? "#f97316"
                        : "#3b82f6",
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: "4, 6",
                  }}
                />
              )}

              <Marker
                position={[item.latitude, item.longitude]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => onSelectHazard(item),
                }}
              >
                <Popup className="ocean-apple-popup" minWidth={280} maxWidth={340}>
                  <div className="p-1 text-zinc-900 font-sans">
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-100">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          item.severity.toLowerCase() === "critical"
                            ? "bg-rose-100 text-rose-700"
                            : item.severity.toLowerCase() === "high"
                            ? "bg-amber-100 text-amber-800"
                            : item.severity.toLowerCase() === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {item.severity.toUpperCase()}
                      </span>

                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1">
                        {item.source === "incois" ? (
                          <>
                            <ShieldAlert className="w-3 h-3 text-blue-600" />
                            Official INCOIS
                          </>
                        ) : (
                          <>
                            <Radio className="w-3 h-3 text-emerald-600" />
                            Crowdsourced
                          </>
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-sm text-zinc-900 leading-snug mb-1">
                      {item.title}
                    </h4>

                    {/* Location Name */}
                    {item.locationName && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{item.locationName}</span>
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-xs text-zinc-600 leading-relaxed mb-3 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Specific Ocean Parameters if available */}
                    {item.parameters && (
                      <div className="grid grid-cols-2 gap-1.5 p-2 bg-zinc-50 rounded-xl mb-3 text-[11px]">
                        {item.parameters.waveHeight && (
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Wave Height</span>
                            <span className="font-semibold text-zinc-800">
                              {item.parameters.waveHeight}
                            </span>
                          </div>
                        )}
                        {item.parameters.windSpeed && (
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Wind Velocity</span>
                            <span className="font-semibold text-zinc-800">
                              {item.parameters.windSpeed}
                            </span>
                          </div>
                        )}
                        {item.parameters.swellPeriod && (
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Swell Period</span>
                            <span className="font-semibold text-zinc-800">
                              {item.parameters.swellPeriod}
                            </span>
                          </div>
                        )}
                        {item.parameters.currentSpeed && (
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Currents</span>
                            <span className="font-semibold text-zinc-800">
                              {item.parameters.currentSpeed}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {item.userName && (
                        <span className="flex items-center gap-1 text-zinc-600 font-medium truncate max-w-[140px]">
                          <User className="w-3 h-3 text-zinc-400" />
                          {item.userName}
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Pinned Marker when user is manually clicking on map */}
        {pinnedCoords && (
          <Marker position={[pinnedCoords.lat, pinnedCoords.lng]} icon={createPinnedMarker()}>
            <Popup autoPan={true}>
              <div className="text-xs p-1">
                <span className="font-bold text-blue-600 block mb-0.5">Report Incident Pin</span>
                <span>
                  {pinnedCoords.lat.toFixed(4)}, {pinnedCoords.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Basemap Layer Switcher (Bottom Right) */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end gap-2">
        {isLayerMenuOpen && (
          <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-2 border border-white/60 dark:border-zinc-800/80 shadow-2xl flex flex-col gap-1 min-w-[170px] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
              Select Basemap
            </span>
            {(
              [
                { id: "ocean", label: "Ocean Bathymetry", icon: "🌊" },
                { id: "osm", label: "OpenStreetMap", icon: "🗺️" },
                { id: "satellite", label: "Satellite View", icon: "🛰️" },
                { id: "dark", label: "Dark Canvas", icon: "🌙" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setBasemap(opt.id);
                  setIsLayerMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  basemap === opt.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </span>
                {basemap === opt.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          title="Switch Basemap Layer"
          className="p-3 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-lg text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
        >
          <Layers className="w-4 h-4" />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">
            {basemap === "ocean"
              ? "Ocean"
              : basemap === "osm"
              ? "OSM"
              : basemap === "satellite"
              ? "Satellite"
              : "Dark"}
          </span>
        </button>
      </div>
    </div>
  );
}
