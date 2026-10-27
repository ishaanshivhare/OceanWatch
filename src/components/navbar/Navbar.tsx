"use client";

import React from "react";
import Link from "next/link";
import { Waves, Plus, ShieldAlert, Radio, BarChart3, Bell, Compass } from "lucide-react";
import { AuthNavActions } from "../auth/AuthNavActions";

interface NavbarProps {
  onOpenReportModal: () => void;
  onToggleIncoisFeed: () => void;
  incoisCount: number;
  reportCount: number;
  criticalCount: number;
}

export function Navbar({
  onOpenReportModal,
  onToggleIncoisFeed,
  incoisCount,
  reportCount,
  criticalCount,
}: NavbarProps) {
  return (
    <header className="fixed top-3 left-3 right-3 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 rounded-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl border border-white/60 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center justify-between transition-all">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  OceanWatch
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  INCOIS • CROWD
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Early Warning & Coastal Hazard Telemetry
              </p>
            </div>
          </Link>
        </div>

        {/* Center Quick Stats / Tabs */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 text-xs font-medium">
          <button
            onClick={onToggleIncoisFeed}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>INCOIS Advisories</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
              {incoisCount}
            </span>
          </button>

          <span className="text-zinc-300 dark:text-zinc-700">•</span>

          <div className="flex items-center gap-1.5 px-3 py-1 text-zinc-700 dark:text-zinc-300">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>User Reports</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              {reportCount}
            </span>
          </div>

          {criticalCount > 0 && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>{criticalCount} Critical</span>
              </div>
            </>
          )}
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2">
          {/* File Report Action Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">Report Hazard</span>
            <span className="sm:hidden">Report</span>
          </button>

          {/* Authentication Actions */}
          <AuthNavActions />
        </div>
      </div>
    </header>
  );
}
