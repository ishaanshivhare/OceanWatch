"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Compass,
  Upload,
  CheckCircle2,
  Loader2,
  Droplet,
  Waves,
  Skull,
  Shield,
  Trash2,
  LifeBuoy,
  Lock,
} from "lucide-react";
import { useAppAuth } from "@/components/auth/AuthProvider";
import { Show, SignInButton } from "@clerk/nextjs";

const HAZARD_TYPES = [
  { id: "Oil Spill", label: "Oil Spill / Chemical Slick", icon: Droplet, desc: "Fuel discharge, sheen, or tarballs" },
  { id: "Algal Bloom", label: "Red Tide / Toxic Bloom", icon: Skull, desc: "Discoloration, dead fish, toxic fumes" },
  { id: "Rogue Wave", label: "Rogue Wave / Swell Inundation", icon: Waves, desc: "Extreme wave series or sudden pier overtopping" },
  { id: "Marine Life Stranding", label: "Wildlife Stranding", icon: LifeBuoy, desc: "Stranded turtles, whales, or jellyfish swarms" },
  { id: "Coastal Flooding", label: "Seawall Breach / Erosion", icon: Shield, desc: "Severe shoreline damage or coastal surge" },
  { id: "Plastic Debris", label: "Ghost Net / Flotsam Hazard", icon: Trash2, desc: "Entangling gear dangerous to marine vessels" },
];

const SEVERITY_LEVELS = [
  { level: "Low", label: "Low", desc: "Routine monitoring" },
  { level: "Medium", label: "Medium", desc: "Caution to small crafts" },
  { level: "High", label: "High", desc: "Urgent response needed" },
  { level: "Critical", label: "Critical", desc: "Emergency life/habitat threat" },
];

export default function ReportPage() {
  const router = useRouter();
  const { isClerkActive, demoUser } = useAppAuth();

  const [title, setTitle] = useState("");
  const [hazardType, setHazardType] = useState("Oil Spill");
  const [severity, setSeverity] = useState("High");
  const [latitude, setLatitude] = useState("18.9600");
  const [longitude, setLongitude] = useState("72.7200");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState(demoUser?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(4));
        setLongitude(pos.coords.longitude.toFixed(4));
        if (!locationName) setLocationName("GPS Detected Shoreline Location");
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg("Failed to detect GPS: " + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !description) {
      setErrorMsg("Please fill in the incident title and description.");
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
          userName: reporterName || demoUser?.name || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed.");

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An error occurred while logging the hazard.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Content of the form
  const FormContent = (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Live Map Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Submit Ocean Hazard Report
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Crowdsourced early warning transmission to Indian National Ocean Services
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Hazard Report Broadcasted!
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Redirecting to the interactive ocean map...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200/90 dark:border-zinc-800 shadow-xl space-y-6"
        >
          {/* Hazard Type */}
          <div>
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2.5">
              1. Hazard Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HAZARD_TYPES.map((h) => {
                const Icon = h.icon;
                const isSelected = hazardType === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => setHazardType(h.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {h.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {h.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              2. Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEVERITY_LEVELS.map((s) => (
                <button
                  type="button"
                  key={s.level}
                  onClick={() => setSeverity(s.level)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    severity === s.level
                      ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-600 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                3. Incident Coordinates
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>Auto-Detect GPS</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="number"
                step="any"
                required
                placeholder="Latitude (e.g. 18.9600)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
              />
              <input
                type="number"
                step="any"
                required
                placeholder="Longitude (e.g. 72.7200)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <input
              type="text"
              placeholder="Coastal landmark / Port / Shoreline reference (e.g. Near Gateway of India, Mumbai)"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                4. Incident Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Extensive Crude Oil Sheen 10 Miles West"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                5. Detailed Description & Evidence *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Detail the hazard extent, smell, visible vessels, tide direction, or endangered marine wildlife..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                Reporter Identity (Optional)
              </label>
              <input
                type="text"
                placeholder="Observer name or maritime callsign"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to OceanWatch...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publish Hazard Incident</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  // If Clerk is active, require login
  if (isClerkActive) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Show when="signed-in">{FormContent}</Show>
        <Show when="signed-out">
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Authentication Required
            </h2>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">
              Only authenticated coastal observers, port officials, and verified citizens can submit official hazard reports.
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer">
                Sign In with Clerk to Continue
              </button>
            </SignInButton>
          </div>
        </Show>
      </div>
    );
  }

  // Demo observer mode
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {FormContent}
    </div>
  );
}
