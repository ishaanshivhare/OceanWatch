"use client";

import React, { useState } from "react";
import { useAppAuth } from "./AuthProvider";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ShieldCheck, LogIn, LogOut, Key, ChevronDown } from "lucide-react";

export function AuthNavActions() {
  const { isClerkActive, demoUser, loginDemo, logoutDemo } = useAppAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showClerkModal, setShowClerkModal] = useState(false);

  if (isClerkActive) {
    return (
      <div className="flex items-center gap-2">
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-white/20 dark:ring-white/10 shadow-sm",
              },
            }}
          />
        </Show>
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-sm transition-all cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </Show>
      </div>
    );
  }

  // Demo observer state
  return (
    <div className="relative flex items-center gap-2">
      {demoUser ? (
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 backdrop-blur-md shadow-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-all text-xs font-medium cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="max-w-[120px] truncate text-zinc-800 dark:text-zinc-200 font-semibold">
              {demoUser.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                  {demoUser.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {demoUser.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {demoUser.role}
                  </p>
                </div>
              </div>

              <div className="py-2 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated for Hazard Filing</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  Mode: Demo Observer. Configure real Clerk keys in .env for production user accounts.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setShowClerkModal(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  Clerk Keys Setup
                </button>
                <button
                  onClick={() => {
                    logoutDemo();
                    setShowDemoMenu(false);
                  }}
                  className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => loginDemo()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-sm transition-all cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Observer Sign In</span>
        </button>
      )}

      {/* Clerk Key Setup Modal */}
      {showClerkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                Clerk Authentication Ready
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              OceanWatch has native Clerk integration for OAuth (Google, GitHub, Apple), magic links, and MFA.
              To switch from the simulated observer to live Clerk accounts:
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 mb-4 space-y-1">
              <div>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...</div>
              <div>CLERK_SECRET_KEY=sk_test_...</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClerkModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:opacity-90 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
