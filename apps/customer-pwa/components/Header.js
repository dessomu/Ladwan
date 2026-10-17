// apps/customer-pwa/components/Header.js - Clean Mobile Header with Profile & Address Settings
"use client";

import {
  MapPin,
  ChevronDown,
  ShoppingCart,
  Store,
  Clock,
  User,
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
  onOpenProfile,
  lang,
}) {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-xl transition-all">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
        {/* Brand & Location Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2">
            {/* Logo block: On small screens, tagline sits right below the logo */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                <span className="text-stone-950 font-black text-base sm:text-lg tracking-tighter">
                  ला
                </span>
              </div>
              <span
                className="text-[8px] font-black text-amber-400 uppercase tracking-tight sm:hidden mt-0.5 whitespace-nowrap leading-none"
                suppressHydrationWarning
              >
                {lang === "hi" ? "ताज़ा आटा" : "Fresh Atta"}
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <div className="font-extrabold text-stone-100 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                <span suppressHydrationWarning>{lang === "hi" ? "लाडवां" : "LADWAN"}</span>
                <span
                  className="hidden sm:inline-block text-amber-400 text-xs font-semibold px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30"
                  suppressHydrationWarning
                >
                  {lang === "hi" ? "ताज़ा आटा" : "FRESH ATTA"}
                </span>
              </div>
              <div
                className="text-[10px] text-stone-400 tracking-wider uppercase font-semibold hidden sm:block"
                suppressHydrationWarning
              >
                {lang === "hi"
                  ? "हाइपर-लोकल पत्थर-पिसा आटा नेटवर्क"
                  : "Hyper-local Stone-Ground Chakki Network"}
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-stone-800 hidden sm:block"></div>

          {/* Delivery Location Pin Pill (Ultra Compact, single-line) */}
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 transition-all text-left group min-w-0"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="min-w-0 flex items-center gap-1">
              <span
                className="text-[10px] font-bold text-amber-400/90 uppercase tracking-tight hidden xs:inline"
                suppressHydrationWarning
              >
                {lang === "hi" ? "डिलीवरी:" : "To:"}
              </span>
              <span
                className="text-[11px] sm:text-xs font-semibold text-stone-200 truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[180px]"
                suppressHydrationWarning
              >
                {location?.name || "Sonarpur, Kolkata"}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-amber-400 shrink-0 transition-colors" />
            </div>
          </button>
        </div>

        {/* Right Actions: Assigned Mill, Live Tracking, Profile & Desktop Cart */}
        <div className="flex items-center gap-2">
          {/* Assigned Mill Quick Pill (Desktop) */}
          {selectedMill && (
            <button
              type="button"
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
                type="button"
                onClick={onOpenTracking}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{lang === "hi" ? "लाइव ऑर्डर" : "Track Order"}</span>
              </button>
            )}

          {/* User Profile / Settings Button (Available on Mobile & Desktop) */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-200 transition-all active:scale-95 shadow-sm group"
            title={lang === "hi" ? "आपकी प्रोफाइल व सेटिंग्स" : "User Profile & Settings"}
            aria-label="Profile and Settings"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-600/30 to-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30 group-hover:scale-105 transition-transform">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold hidden md:inline" suppressHydrationWarning>
              {lang === "hi" ? "प्रोफाइल" : "Profile"}
            </span>
          </button>

          {/* Cart Pill with ShoppingCart Grocery Trolley (Desktop / Tablet only) */}
          <button
            type="button"
            onClick={onOpenCart}
            className={`relative hidden sm:flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
              cartCount > 0
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20"
                : "bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span suppressHydrationWarning>
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
