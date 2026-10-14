"use client";

import { useState } from "react";
import {
  Store,
  Power,
  Volume2,
  Bell,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Languages,
  LogOut,
} from "lucide-react";

export default function Header({
  mill,
  user,
  onLogout,
  onToggleStatus,
  onUpdateStatusReason,
  onSimulateOrder,
  onPlayChime,
  onOpenProfile,
  onResetData,
  isFirebase,
  lang,
  toggleLang,
  t,
}) {
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [isChimeTesting, setIsChimeTesting] = useState(false);

  const quickReasons = [
    { label: t.statusRunning, open: true, icon: "⚡" },
    { label: t.statusPowerCut, open: false, icon: "🔌" },
    { label: t.statusStockOut, open: false, icon: "🌾" },
    { label: t.statusMaintenance, open: false, icon: "⚙️" },
    { label: t.statusLunchBreak, open: false, icon: "🍱" },
    { label: t.statusDayEnd, open: false, icon: "🌙" },
  ];

  const handleTestChime = () => {
    setIsChimeTesting(true);
    onPlayChime();
    setTimeout(() => setIsChimeTesting(false), 800);
  };

  const displayName = lang === "en" && mill.englishName ? mill.englishName : mill.name;

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-xl transition-all">
      {/* Top Status Bar: Connection, Location & Language Switch */}
      <div className="bg-stone-950 px-3 py-1.5 flex items-center justify-between text-xs border-b border-stone-800/60">
        <div className="flex items-center gap-2 text-stone-400">
          <span className="flex items-center gap-1 font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {t.networkTitle}
          </span>
          <span className="text-stone-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-stone-400">
            <MapPin className="w-3 h-3 text-stone-500" />
            {mill.area || "Sector 14, Gurugram"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            title={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold text-[11px] border border-amber-500/30 transition-all active:scale-95 shadow-sm"
          >
            <Languages className="w-3 h-3 text-amber-400" />
            <span>{lang === "hi" ? "English" : "हिंदी"}</span>
          </button>

          {isFirebase ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {t.liveFirebase}
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {t.demoStoreActive}
            </span>
          )}

          <button
            onClick={onResetData}
            title={t.resetData}
            className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">{t.resetData}</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
              <span className="hidden lg:inline text-[11px] text-stone-300">
                <span className="text-stone-400">{t.loggedInAs}</span>{" "}
                <span className="font-semibold text-amber-300">
                  {lang === "en" && user.englishDisplayName ? user.englishDisplayName : user.displayName || user.email}
                </span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                title={t.logoutBtn}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800/80 hover:bg-red-950/60 hover:text-red-300 text-stone-300 text-[11px] border border-stone-700/60 hover:border-red-800/60 transition-all active:scale-95"
              >
                <LogOut className="w-3 h-3 text-stone-400" />
                <span>{t.logoutBtn}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mill Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-900/40 ring-2 ring-amber-400/20 flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  {displayName}
                  <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" title={t.verifiedChakki} />
                </h1>
              </div>
              <p className="text-xs text-amber-200/80 font-medium line-clamp-1">
                {mill.tagline}
              </p>
            </div>
          </div>

          {/* Action Row: Live Toggle & Quick Tools */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Quick Chime & Simulator Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTestChime}
                title={t.testChime}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                  isChimeTesting
                    ? "bg-amber-500/20 text-amber-300 border-amber-500 ring-2 ring-amber-500/30"
                    : "bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700/80 hover:text-white"
                }`}
              >
                <Volume2 className={`w-4 h-4 ${isChimeTesting ? "animate-bounce text-amber-400" : ""}`} />
                <span className="hidden md:inline">{t.testChime}</span>
              </button>

              <button
                type="button"
                onClick={onSimulateOrder}
                title={t.simulateOrder}
                className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.simulateOrder}</span>
              </button>
            </div>

            {/* THE MASTER TOGGLE: Dukan Chalu / Band */}
            <div className="relative">
              <button
                type="button"
                onClick={onToggleStatus}
                className={`group flex items-center gap-3 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-lg active:scale-95 border ${
                  mill.isOpen
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-400/40 shadow-emerald-950/50"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-red-400/40 shadow-red-950/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      mill.isOpen
                        ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-pulse"
                        : "bg-stone-300 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    }`}
                  ></span>
                  <span>{mill.isOpen ? t.dukanOpen : t.dukanClosed}</span>
                </span>

                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReasonDropdown(!showReasonDropdown);
                  }}
                  className="pl-2 border-l border-white/20 hover:text-stone-200 cursor-pointer"
                  title={t.changeReason}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Quick Status Reason Popover */}
              {showReasonDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-stone-400 font-medium border-b border-stone-800 flex items-center justify-between">
                    <span>{t.changeReason}</span>
                    <button
                      onClick={() => setShowReasonDropdown(false)}
                      className="text-stone-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {quickReasons.map((reason, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onUpdateStatusReason(reason.label, reason.open);
                          setShowReasonDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                          mill.statusReason === reason.label
                            ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                            : "text-stone-300 hover:bg-stone-800"
                        }`}
                      >
                        <span className="text-base">{reason.icon}</span>
                        <div className="flex-1">
                          <p className="line-clamp-1">{reason.label}</p>
                          <span className={`text-[10px] ${reason.open ? "text-emerald-400" : "text-red-400"}`}>
                            {reason.open ? t.storeWillOpen : t.storeWillClose}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Reason Banner Bar */}
        <div className="mt-2.5 pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-300">
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                mill.isOpen ? "bg-emerald-400" : "bg-red-400"
              }`}
            ></span>
            <span className="text-stone-400 font-medium flex-shrink-0">{t.currentStatus}</span>
            <span className="font-semibold text-stone-100 truncate">
              {mill.statusReason || (mill.isOpen ? t.statusRunning : t.statusDayEnd)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-stone-400 flex-shrink-0 ml-2">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-amber-400" />
              {mill.openingTime} - {mill.closingTime}
            </span>
            <button
              onClick={onOpenProfile}
              className="text-amber-400 hover:text-amber-300 font-medium text-xs underline underline-offset-2"
            >
              {t.editProfile}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
