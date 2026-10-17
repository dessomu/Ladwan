// apps/customer-pwa/components/Header.js - Unified Ladwan Header matching admin-mills aesthetics
"use client";

import {
  MapPin,
  ChevronDown,
  ShoppingBag,
  Store,
  Clock,
  Sparkles,
  RotateCcw,
  Languages,
  Wheat,
  ShieldCheck,
} from "lucide-react";
import { isFirebaseConfigured } from "@ladwan/firebase";

export default function Header({
  location,
  onOpenLocationModal,
  selectedMill,
  onOpenMillModal,
  cartCount,
  cartTotal,
  onOpenCart,
  activeOrder,
  onOpenTracking,
  lang,
  onToggleLang,
  onResetData,
}) {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-xl transition-all">
      {/* 1. Top Status Bar: Matching admin-mills layout */}
      <div className="bg-stone-950 px-3 py-1.5 flex items-center justify-between text-xs border-b border-stone-800/60">
        <div className="flex items-center gap-2 text-stone-400">
          <span className="flex items-center gap-1.5 font-medium text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="font-bold">
              {lang === "hi" ? "लाडवां चक्की नेटवर्क" : "Ladwan Network"}
            </span>
          </span>

          <span className="text-stone-600 hidden sm:inline">•</span>

          {/* Clickable Quick Location */}
          <button
            onClick={onOpenLocationModal}
            className="hidden sm:inline-flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <MapPin className="w-3 h-3 text-stone-500" />
            <span className="underline underline-offset-2 decoration-stone-700">
              {location?.name || "Sonarpur, Kolkata"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Language Toggle Pill */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold text-[11px] border border-amber-500/30 transition-all active:scale-95 shadow-sm"
          >
            <Languages className="w-3 h-3 text-amber-400" />
            <span>{lang === "hi" ? "English" : "हिंदी"}</span>
          </button>

          {/* Connection Mode Indicator */}
          {isFirebaseConfigured ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{lang === "hi" ? "लाइव Firebase" : "Live Firebase"}</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>{lang === "hi" ? "डेमो स्टोर सक्रिय" : "Demo Store"}</span>
            </span>
          )}

          {/* Reset / Clear Data */}
          {onResetData && (
            <button
              onClick={onResetData}
              title={lang === "hi" ? "डेटा रीसेट करें" : "Reset Data"}
              className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">
                {lang === "hi" ? "रीसेट" : "Reset"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Location Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <span className="text-stone-950 font-black text-lg tracking-tighter">
                ला
              </span>
            </div>
            <div>
              <div className="font-extrabold text-stone-100 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                <span>{lang === "hi" ? "लाडवां" : "LADWAN"}</span>
                <span className="text-amber-400 text-xs font-semibold px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30">
                  {lang === "hi" ? "ताज़ा आटा" : "FRESH ATTA"}
                </span>
              </div>
              <div className="text-[10px] text-stone-400 tracking-wider uppercase font-semibold hidden xs:block">
                {lang === "hi"
                  ? "हाइपर-लोकल पत्थर-पिसा आटा नेटवर्क"
                  : "Hyper-local Stone-Ground Chakki Network"}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-800 hidden sm:block"></div>

          {/* Delivery Location Pin Pill (Clickable) */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 transition-all text-left group min-w-0"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>{lang === "hi" ? "डिलीवरी का पता" : "Delivering to"}</span>
                <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="text-xs font-semibold text-stone-200 truncate max-w-[130px] sm:max-w-[180px]">
                {location?.name || "Sonarpur, Kolkata"}
              </div>
            </div>
          </button>
        </div>

        {/* Right Actions: Assigned Mill, Live Tracking & Cart */}
        <div className="flex items-center gap-2">
          {/* Assigned Mill Quick Pill */}
          {selectedMill && (
            <button
              onClick={onOpenMillModal}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-stone-700 text-left transition-colors"
            >
              <Store className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left text-xs">
                <div className="text-[10px] text-stone-400">
                  {selectedMill.formattedDistance || "1.2 km"} • {selectedMill.eta || "30-40 min"}
                </div>
                <div className="font-semibold text-stone-200 truncate max-w-[160px]">
                  {selectedMill.name}
                </div>
              </div>
            </button>
          )}

          {/* Live Order Tracking Pill (Desktop / Tablet) */}
          {activeOrder &&
            activeOrder.orderStatus !== "delivered" &&
            activeOrder.orderStatus !== "cancelled" && (
              <button
                onClick={onOpenTracking}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "लाइव ऑर्डर ट्रैकिंग" : "Track Order"}</span>
              </button>
            )}

          {/* Cart Pill */}
          <button
            onClick={onOpenCart}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
              cartCount > 0
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20"
                : "bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {cartCount > 0 ? (
                <>
                  <span className="hidden sm:inline">
                    {lang === "hi" ? "टोकरी • " : "Cart • "}
                  </span>
                  ₹{cartTotal}
                </>
              ) : (
                <span>{lang === "hi" ? "टोकरी" : "Cart"}</span>
              )}
            </span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-stone-950 text-amber-400 text-[10px] flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
