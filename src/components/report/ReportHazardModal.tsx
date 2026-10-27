"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  MapPin,
  Compass,
  FileText,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  Droplet,
  Waves,
  Skull,
  Shield,
  Trash2,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface ReportHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated?: () => void;
  initialCoords?: { lat: number; lng: number } | null;
  onEnablePinMode?: () => void;
}

const HAZARD_TYPES = [
  {
    id: "Oil Spill",
    label: "Oil Spill / Chemical Slick",
    icon: Droplet,
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    desc: "Iridescent fuel sheen, dark tarballs, or tanker bilge discharge",
  },
  {
    id: "Algal Bloom",
    label: "Red Tide / Toxic Algal Bloom",
    icon: Skull,
    color: "text-rose-600 bg-rose-500/10 border-rose-500/20",
    desc: "Water discoloration, foam, fish mortality, respiratory irritants",
  },
  {
    id: "Rogue Wave",
    label: "Rogue Wave / Swell Inundation",
    icon: Waves,
    color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20",
    desc: "Sudden abnormally large wave series or sudden jetty overtopping",
  },
  {
    id: "Marine Life Stranding",
    label: "Marine Wildlife Stranding",
    icon: LifeBuoy,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    desc: "Stranded sea turtles, cetaceans, or large jellyfish swarms",
  },
  {
    id: "Coastal Flooding",
    label: "Seawall Breach / Coastal Erosion",
    icon: Shield,
    color: "text-orange-600 bg-orange-500/10 border-orange-500/20",
    desc: "Severe beach erosion, tidal flooding encroaching structures",
  },
  {
    id: "Plastic Debris",
    label: "Dense Ghost Nets / Plastic Flotsam",
    icon: Trash2,
    color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    desc: "Submerged discarded fishing gear posing propeller snare hazard",
  },
];

const SEVERITY_LEVELS = [
  {
    level: "Low",
    label: "Low (Advisory)",
    color: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    ring: "focus:ring-blue-500",
    desc: "Minor anomaly; standard monitoring advised",
  },
  {
    level: "Medium",
    label: "Medium (Caution)",
    color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    ring: "focus:ring-yellow-500",
    desc: "Noticeable impact on near-shore small crafts & bathers",
  },
  {
    level: "High",
    label: "High (Urgent)",
    color: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    ring: "focus:ring-orange-500",
    desc: "Serious hazard; active operational response suggested",
  },
  {
    level: "Critical",
    label: "Critical (Emergency)",
    color: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    ring: "focus:ring-rose-500",
    desc: "Immediate danger to life, commercial vessels, or coastal ecosystem",
  },
];

export function ReportHazardModal({
  isOpen,
  onClose,
  onReportCreated,
  initialCoords,
  onEnablePinMode,
}: ReportHazardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [hazardType, setHazardType] = useState<string>("Oil Spill");
  const [severity, setSeverity] = useState<string>("High");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [latitude, setLatitude] = useState<string>(
    initialCoords ? initialCoords.lat.toFixed(4) : ""
  );
  const [longitude, setLongitude] = useState<string>(
    initialCoords ? initialCoords.lng.toFixed(4) : ""
  );
  const [locationName, setLocationName] = useState<string>("");
  const [reporterName, setReporterName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Sync coords if updated from outside map click
  React.useEffect(() => {
    if (initialCoords) {
      setLatitude(initialCoords.lat.toFixed(4));
      setLongitude(initialCoords.lng.toFixed(4));
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        if (!locationName) {
          setLocationName("Observer GPS Detected Position");
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setErrorMsg("Could not retrieve GPS location: " + error.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a short descriptive title for the incident.");
      return;
    }
    if (!latitude || !longitude) {
      setErrorMsg("Please specify or detect latitude and longitude.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please provide detailed observations in the description.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          hazardType,
          severity,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          locationName: locationName || undefined,
          description,
          userName: reporterName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit report.");
      }

      setIsSuccess(true);
      if (onReportCreated) onReportCreated();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset form
        setTitle("");
        setDescription("");
        setLocationName("");
        setStep(1);
      }, 1600);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred while saving report.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Ocean Incident Filing
              </h3>
              <p className="text-[11px] text-zinc-500">
                Crowdsourced Marine Hazard Network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progression Indicators */}
        <div className="px-6 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/40 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  step === s
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <span>Step {s}</span>
                <span className="opacity-75">
                  {s === 1 ? "• Hazard" : s === 2 ? "• Location" : "• Details"}
                </span>
              </button>
            ))}
          </div>

          <span className="text-[11px] text-zinc-400 font-mono">
            {step} of 3
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Splash */}
        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Report Successfully Logged!
            </h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Your geotagged ocean hazard report has been published to the interactive map and synchronized with coastal telemetry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Hazard Type & Severity */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Select Hazard Classification
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HAZARD_TYPES.map((h) => {
                      const Icon = h.icon;
                      const isSelected = hazardType === h.id;
                      return (
                        <div
                          key={h.id}
                          onClick={() => setHazardType(h.id)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-500"
                              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`p-1.5 rounded-lg border ${h.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                              {h.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                            {h.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Urgency & Severity Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SEVERITY_LEVELS.map((s) => (
                      <button
                        type="button"
                        key={s.level}
                        onClick={() => setSeverity(s.level)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          severity === s.level
                            ? `${s.color} ring-2 ring-current font-bold shadow-xs`
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <div className="text-xs font-bold">{s.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5 leading-tight">
                          {s.desc.split(";")[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Location</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location Geotagging */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Geographic Coordinates
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {isLocating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Compass className="w-3.5 h-3.5" />
                      )}
                      <span>Detect My GPS</span>
                    </button>

                    {onEnablePinMode && (
                      <button
                        type="button"
                        onClick={() => {
                          onEnablePinMode();
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Pick on Map</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Latitude (-90° to +90°)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 18.9600"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Longitude (-180° to +180°)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 72.7200"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Coastal Landmark / Sector Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 5 nautical miles off Colaba Point, Mumbai"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                  <span className="font-semibold block mb-0.5">Maritime Safety Tip:</span>
                  Pin accuracy within 1 nautical mile facilitates prompt dispatch from Indian Coast Guard and port state control.
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!latitude || !longitude) {
                        setErrorMsg("Please provide valid coordinates to continue.");
                        return;
                      }
                      setErrorMsg("");
                      setStep(3);
                    }}
                    className="flex items-center gap-1 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Description, Title & Observer ID */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Incident Title / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dark Fuel Oil Slick Dispersing Southward"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Detailed Observations & Visual Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe size, movement trajectory, vessel names involved, weather conditions, water discoloration, smell, or impact on marine fauna..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Reporter Designation / Vessel Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Capt. Rajesh V. (Trawler MV Sagarika) or Coastal Volunteer"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Broadcasting to Network...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Publish Incident Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
