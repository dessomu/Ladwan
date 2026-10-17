// apps/customer-pwa/components/Header.js - Sticky Top Bar with Location & Cart
"use client";

import {
  MapPin,
  ChevronDown,
  ShoppingBag,
  Store,
  Clock,
  Sparkles,
  RotateCcw,
} from "lucide-react";

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
}) {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80 transition-all">
      {/* Top mini-strip: Brand & Fresh Milling Promise */}
      <div className="bg-gradient-to-r from-amber-950/50 via-stone-900 to-amber-950/40 px-4 py-1.5 border-b border-amber-900/20 flex items-center justify-between text-[11px] text-amber-300">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>100% ताज़ा पारंपरिक पत्थर-पिसा आटा • No Warehouse Storage</span>
        </div>
        <button
          onClick={onToggleLang}
          className="text-stone-300 hover:text-amber-400 text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-800/80 border border-stone-700/60 transition-colors"
        >
          {lang === "hi" ? "English" : "हिन्दी"}
        </button>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Location */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <span className="text-stone-950 font-black text-base tracking-tighter">
                ला
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold text-stone-100 text-sm tracking-tight flex items-center gap-1">
                <span>लाडवां</span>
                <span className="text-amber-400 text-xs font-normal">LADWAN</span>
              </div>
              <div className="text-[10px] text-stone-400 tracking-wider uppercase font-semibold">
                ताज़ा चक्की नेटवर्क
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-800 hidden sm:block"></div>

          {/* Location Pin Pill (Clickable) */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/40 transition-all text-left group min-w-0"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>{lang === "hi" ? "डिलीवरी का पता" : "Delivering to"}</span>
                <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <div className="text-xs font-semibold text-stone-200 truncate max-w-[140px] sm:max-w-[200px]">
                {location?.name || "Sonarpur, Kolkata"}
              </div>
            </div>
          </button>
        </div>

        {/* Assigned Mill Quick Status & Actions */}
        <div className="flex items-center gap-2">
          {/* Mill Indicator */}
          {selectedMill && (
            <button
              onClick={onOpenMillModal}
              className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-900/70 border border-stone-800 hover:border-stone-700 text-left transition-colors"
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

          {/* Live Order Tracking Button (if active order exists) */}
          {activeOrder && activeOrder.orderStatus !== "delivered" && activeOrder.orderStatus !== "cancelled" && (
            <button
              onClick={onOpenTracking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all animate-pulse"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">लाइव ट्रैकिंग</span>
              <span>(1)</span>
            </button>
          )}

          {/* Cart Floating / Sticky Pill */}
          <button
            onClick={onOpenCart}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
              cartCount > 0
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20"
                : "bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {cartCount > 0 ? (
                <>
                  <span className="hidden sm:inline">टोकरी • </span>₹{cartTotal}
                </>
              ) : (
                <span>टोकरी</span>
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
