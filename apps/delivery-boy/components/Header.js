// apps/delivery-boy/components/Header.js
"use client";

import { Bike, Wifi, WifiOff, Globe } from "lucide-react";

export default function Header({ store }) {
  const { agentProfile, toggleOnlineStatus, toggleLang, lang, isFirebase } = store;
  const isOnline = agentProfile?.isOnline !== false;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Brand + Agent identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-white leading-tight flex items-center gap-1.5">
              <span>LADWAN</span>
              <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 tracking-wide">
                DELIVERY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium" suppressHydrationWarning>
              {lang === "hi"
                ? (agentProfile?.name || "डिलीवरी एजेंट")
                : (agentProfile?.englishName || agentProfile?.name || "Delivery Agent")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Firebase live badge */}
          {isFirebase && (
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              LIVE
            </span>
          )}

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all active:scale-90"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Online/Offline toggle */}
          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isOnline
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25"
                : "bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300"
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
                <Wifi className="w-3 h-3" />
                <span suppressHydrationWarning>{lang === "hi" ? "ऑनलाइन" : "Online"}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span suppressHydrationWarning>{lang === "hi" ? "ऑफलाइन" : "Offline"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
